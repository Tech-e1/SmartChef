import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import {
  RECIPE_GENERATION_SYSTEM_PROMPT,
  createRecipeUserPrompt,
  NVIDIA_CONFIG,
  GROQ_CONFIG,
  CLOUDFLARE_CONFIG,
} from '@/lib/prompts';

type ProviderType = 'openai' | 'cloudflare';

interface AIProviderConfig {
  name: string;
  type: ProviderType;
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
  temperature: number;
}

const PROVIDERS: AIProviderConfig[] = [
  {
    name: 'Groq',
    type: 'openai',
    apiKey: GROQ_CONFIG.apiKey,
    baseUrl: GROQ_CONFIG.baseUrl,
    model: GROQ_CONFIG.model,
    temperature: GROQ_CONFIG.temperature,
  },
  {
    name: 'Cloudflare',
    type: 'cloudflare',
    apiKey: CLOUDFLARE_CONFIG.apiToken,
    baseUrl: CLOUDFLARE_CONFIG.baseUrl,
    model: CLOUDFLARE_CONFIG.model,
    temperature: CLOUDFLARE_CONFIG.temperature,
  },
  {
    name: 'NVIDIA',
    type: 'openai',
    apiKey: NVIDIA_CONFIG.apiKey,
    baseUrl: NVIDIA_CONFIG.baseUrl,
    model: NVIDIA_CONFIG.model,
    temperature: NVIDIA_CONFIG.temperature,
  },
];

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls an AI provider and returns the assistant's text content.
 * Supports OpenAI-compatible (/chat/completions) and Cloudflare Workers AI (/run/{model}).
 * Retries once on 429 rate limit.
 */
async function callAI(config: AIProviderConfig, userPrompt: string): Promise<string> {
    if (!config.apiKey) {
        throw new Error(`${config.name} API key is not configured`);
    }

    for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        try {
            if (config.type === 'cloudflare') {
                return await callCloudflare(config, userPrompt, controller, timeoutId, attempt);
            }
            return await callOpenAICompatible(config, userPrompt, controller, timeoutId, attempt);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw new Error(`${config.name} rate limit exhausted`);
}

async function callOpenAICompatible(
    config: AIProviderConfig,
    userPrompt: string,
    controller: AbortController,
    timeoutId: ReturnType<typeof setTimeout>,
    attempt: number
): Promise<string> {
    console.log(`[${config.name}] Calling ${config.baseUrl}/chat/completions with model ${config.model} (attempt ${attempt + 1})`);
    const startTime = Date.now();
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: RECIPE_GENERATION_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: config.temperature,
            max_tokens: 4096,
        }),
        signal: controller.signal,
    });
    const duration = Date.now() - startTime;
    console.log(`[${config.name}] Response received: status=${response.status} in ${duration}ms`);

    if (response.status === 429 && attempt === 0) {
        const errorText = await response.text();
        let retryAfter = 5000;
        const match = errorText.match(/try again in ([0-9.]+)s/);
        if (match) {
            retryAfter = parseFloat(match[1]) * 1000;
        }
        console.log(`[${config.name}] Rate limited. Retrying in ${retryAfter}ms...`);
        await sleep(retryAfter);
        return callOpenAICompatible(config, userPrompt, controller, timeoutId, attempt + 1);
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`${config.name} API error:`, errorText);
        throw new Error(`${config.name} API responded with status ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message || {};
    const content = message.content || message.reasoning_content || '';
    console.log(`[${config.name}] Response keys:`, Object.keys(data), '| content length:', content?.length || 0);
    if (!content || !content.trim()) {
        console.error(`[${config.name}] Empty content. Full data:`, JSON.stringify(data).slice(0, 2000));
    }
    return content;
}

async function callCloudflare(
    config: AIProviderConfig,
    userPrompt: string,
    controller: AbortController,
    timeoutId: ReturnType<typeof setTimeout>,
    attempt: number
): Promise<string> {
    const url = `${config.baseUrl}/run/${config.model}`;
    console.log(`[${config.name}] Calling ${url} (attempt ${attempt + 1})`);
    const startTime = Date.now();
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: RECIPE_GENERATION_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            temperature: config.temperature,
            max_tokens: 4096,
        }),
        signal: controller.signal,
    });
    const duration = Date.now() - startTime;
    console.log(`[${config.name}] Response received: status=${response.status} in ${duration}ms`);

    if (response.status === 429 && attempt === 0) {
        const errorText = await response.text();
        let retryAfter = 5000;
        console.log(`[${config.name}] Rate limited. Retrying in ${retryAfter}ms...`);
        await sleep(retryAfter);
        return callCloudflare(config, userPrompt, controller, timeoutId, attempt + 1);
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`${config.name} API error:`, errorText);
        throw new Error(`${config.name} API responded with status ${response.status}`);
    }

    const data = await response.json();
        // Cloudflare response formats:
        //   { result: { response: "..." } }
        //   { result: { text: "..." } }
        //   { result: { choices: [{ message: { content: "..." } }] } }  (OpenAI-compatible)
        //   { result: "..." }
        let content = '';
        if (typeof data.result === 'string') {
            content = data.result;
        } else if (data.result && typeof data.result === 'object') {
            const candidate = data.result.response ?? data.result.text ?? data.result.content;
            if (typeof candidate === 'string') content = candidate;
            else {
                // OpenAI-compatible choices format inside result
                const choices = data.result.choices || [];
                const firstChoice = choices[0] || {};
                const msgContent = firstChoice?.message?.content || '';
                if (typeof msgContent === 'string') content = msgContent;
            }
        }
        if (!content) {
            const messages = data.result?.messages || data.messages || [];
            const assistantMsg = messages.find((m: any) => m.role === 'assistant') || messages[0];
            if (assistantMsg && typeof assistantMsg.content === 'string') {
                content = assistantMsg.content;
            }
        }
        if (typeof content !== 'string') {
            content = '';
        }
        console.log(`[${config.name}] Response keys:`, Object.keys(data), '| content length:', content?.length || 0);
        if (!content || !content.trim()) {
            console.error(`[${config.name}] Empty content. Full data:`, JSON.stringify(data).slice(0, 5000));
        }
        return content;
}

/**
 * Extracts a JSON array of recipes from the model's raw text, tolerating markdown fences and truncation.
 */
function parseRecipes(raw: string): any[] {
    let text = raw.trim();

    // Strip markdown code fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
        text = fenceMatch[1].trim();
    }

    // Find the first JSON-delimiting character
    const objStart = text.indexOf('{');
    const arrStart = text.indexOf('[');
    const start =
        arrStart !== -1 && (objStart === -1 || arrStart < objStart) ? arrStart : objStart;
    if (start === -1) {
        throw new Error('No JSON object or array found');
    }
    text = text.slice(start);

    // Attempt 1: direct parse
    try {
        const parsed = JSON.parse(text);
        return normalizeRecipes(parsed);
    } catch {
        // fall through to repair attempts
    }

    // Attempt 2: balance braces/brackets by counting opening vs closing
    try {
        const balanced = balanceBrackets(text);
        const parsed = JSON.parse(balanced);
        return normalizeRecipes(parsed);
    } catch {
        // fall through
    }

    // Attempt 3: try adding missing closing bracket/brace
    try {
        const firstChar = text[0];
        let repaired = text.trim();
        if (firstChar === '[') {
            // Count brackets to see if we're missing closing ]
            const openBrackets = (repaired.match(/\[/g) || []).length;
            const closeBrackets = (repaired.match(/\]/g) || []).length;
            if (openBrackets > closeBrackets) {
                repaired = repaired + ']';
            }
        } else if (firstChar === '{') {
            const openBraces = (repaired.match(/\{/g) || []).length;
            const closeBraces = (repaired.match(/\}/g) || []).length;
            if (openBraces > closeBraces) {
                repaired = repaired + '}';
            }
        }
        const parsed = JSON.parse(repaired);
        return normalizeRecipes(parsed);
    } catch {
        // fall through
    }

    // Attempt 4: find last position where braces/brackets are balanced
    try {
        const lastBalanced = findLastBalancedPosition(text);
        if (lastBalanced !== -1) {
            const repaired = text.slice(0, lastBalanced + 1);
            const parsed = JSON.parse(repaired);
            return normalizeRecipes(parsed);
        }
    } catch {
        // fall through
    }

    throw new Error('Cannot repair truncated JSON');
}

function normalizeRecipes(parsed: any): any[] {
    const normalizedRecipes = Array.isArray(parsed) ? parsed : [parsed];
    return normalizedRecipes.map((recipe: any) => ({
        ...recipe,
        ingredients: (recipe.ingredients || []).map((ing: any) => ({
            ...ing,
            item:
                typeof ing.item === 'string'
                    ? ing.item
                    : ing.item?.name || ing.name || '',
        })),
    }));
}

/**
 * Counts open vs close braces/brackets and trims to the last position
 * where they are balanced.
 */
function balanceBrackets(text: string): string {
    let depth = 0;
    let inString = false;
    let escaped = false;
    let lastBalanced = -1;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === '\\' && inString) {
            escaped = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;

        if (ch === '{' || ch === '[') {
            depth++;
        } else if (ch === '}' || ch === ']') {
            depth--;
            if (depth === 0) {
                lastBalanced = i;
            }
        }
    }

    if (lastBalanced !== -1) {
        return text.slice(0, lastBalanced + 1);
    }
    return text;
}

/**
 * Alternative balanced-position finder that returns the last index
 * where depth returns to zero.
 */
function findLastBalancedPosition(text: string): number {
    let depth = 0;
    let inString = false;
    let escaped = false;
    let lastZero = -1;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === '\\' && inString) {
            escaped = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;

        if (ch === '{' || ch === '[') {
            depth++;
        } else if (ch === '}' || ch === ']') {
            depth--;
            if (depth === 0) {
                lastZero = i;
            }
        }
    }

    return lastZero;
}

/**
 * Checks whether any generated recipe uses at least one of the requested ingredients.
 * Accepts ingredients as strings or objects with a `name` property.
 */
function usesRequestedIngredients(recipes: any[], ingredients: any[]): boolean {
    const requested = ingredients.map((i) => {
        if (typeof i === 'string') return i.toLowerCase().trim();
        if (i && typeof i === 'object' && i.name) return i.name.toLowerCase().trim();
        return String(i || '').toLowerCase().trim();
    }).filter(Boolean);
    return recipes.some((recipe) => {
        const recipeIngredients = (recipe.ingredients || []).map((ing: any) =>
            (ing.item || '').toLowerCase().trim()
        );
        return recipeIngredients.some((ri: string) =>
            requested.some((req) => ri.includes(req) || req.includes(ri))
        );
    });
}

/**
 * API handler for generating recipes based on provided ingredients and dietary preferences.
 * Tries providers in order: Groq → Cloudflare → NVIDIA. Falls back to the next provider on any error.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { ingredients, dietaryPreferences } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        const userPrompt = createRecipeUserPrompt(ingredients, dietaryPreferences);
        let lastError: Error | null = null;

        // Try each provider in order until one succeeds
        for (const provider of PROVIDERS) {
            if (!provider.apiKey) {
                console.log(`[${provider.name}] Skipping — API key not configured`);
                continue;
            }

            try {
                let raw = await callAI(provider, userPrompt);
                let recipes: any[] = [];
                let parsedOk = false;

                if (raw && raw.trim()) {
                    try {
                        recipes = parseRecipes(raw);
                        parsedOk = true;
                    } catch (parseError) {
                        console.error(`[${provider.name}] Failed to parse response as JSON:`, parseError);
                    }
                }

                const needsRetry = !parsedOk || !usesRequestedIngredients(recipes, ingredients);
                if (needsRetry) {
                    console.warn(`[${provider.name}] Retrying with stricter prompt...`);
                    const strictPrompt = `${userPrompt}\n\nCRITICAL: You MUST use ONLY ingredients from the user's provided list. Do NOT add, substitute, or invent any ingredient not on the list. Every ingredient item in your JSON must match one of the user's provided ingredients exactly. Respond with valid JSON ONLY (no markdown, no code blocks, no explanations).`;
                    const retryRaw = await callAI(provider, strictPrompt);
                    if (retryRaw && retryRaw.trim()) {
                        try {
                            const retryRecipes = parseRecipes(retryRaw);
                            const retryOk = usesRequestedIngredients(retryRecipes, ingredients);

                            if (!parsedOk) {
                                // First attempt failed to parse — accept retry only if it matches ingredients
                                if (retryOk) {
                                    recipes = retryRecipes;
                                    parsedOk = true;
                                }
                            } else if (retryOk && retryRecipes.length >= recipes.length) {
                                // First attempt parsed but failed ingredient check —
                                // only replace if retry has at least as many recipes
                                recipes = retryRecipes;
                                parsedOk = true;
                            }
                            // If parsedOk was true and retry isn't better, keep original recipes
                        } catch (retryParseError) {
                            console.error(`[${provider.name}] Failed to parse retry response as JSON:`, retryParseError);
                        }
                    }
                }

                if (parsedOk) {
                    res.status(200).json({ recipes: JSON.stringify(recipes) });
                    return;
                }
            } catch (error: any) {
                lastError = error;
                console.log(`[${provider.name}] Failed:`, error.message);
                await sleep(1000); // Small delay before trying next provider
                continue;
            }
        }

        // All providers failed
        const errorMessage = lastError?.message || 'All AI providers failed';
        res.status(500).json({ error: `Recipe generation failed: ${errorMessage}` });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to generate recipes' });
    }
};

export default apiMiddleware(['POST'], handler);
