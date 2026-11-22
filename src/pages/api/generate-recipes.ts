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
        // Cloudflare response: { result: { response: "..." } } or { result: { messages: [...] } }
        let content = data.result?.response || data.result?.text || data.result?.content || '';
        if (typeof content !== 'string') {
            // Try to extract from messages array (chat completion format)
            const messages = data.result?.messages || data.messages || [];
            const assistantMsg = messages.find((m: any) => m.role === 'assistant') || messages[0];
            content = assistantMsg?.content || '';
        }
        if (typeof content !== 'string') {
            content = '';
        }
        console.log(`[${config.name}] Response keys:`, Object.keys(data), '| content length:', content?.length || 0);
        if (!content || !content.trim()) {
            console.error(`[${config.name}] Empty content. Full data:`, JSON.stringify(data).slice(0, 2000));
        }
        return content;
}

/**
 * Extracts a JSON array of recipes from the model's raw text, tolerating markdown fences and truncation.
 */
function parseRecipes(raw: string): any[] {
    let text = raw.trim();
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
        text = fenceMatch[1].trim();
    }
    if (!text.startsWith('{') && !text.startsWith('[')) {
        const objStart = text.indexOf('{');
        const arrStart = text.indexOf('[');
        const start = arrStart !== -1 && (objStart === -1 || arrStart < objStart) ? arrStart : objStart;
        if (start !== -1) {
            text = text.slice(start);
        }
    }
    // Try to repair truncated JSON by finding the last complete closing brace/bracket
        try {
            const parsed = JSON.parse(text);
            // Normalize ingredients: ensure item is a string, not an object
            const normalizedRecipes = Array.isArray(parsed) ? parsed : [parsed];
            const normalized = normalizedRecipes.map((recipe: any) => ({
                ...recipe,
                ingredients: (recipe.ingredients || []).map((ing: any) => ({
                    ...ing,
                    item: typeof ing.item === 'string' ? ing.item : ing.item?.name || ing.name || '',
                })),
            }));
            return normalized;
        } catch {
            // Try repairing: find last complete object
            const lastBrace = text.lastIndexOf('}');
            const lastBracket = text.lastIndexOf(']');
            const end = Math.max(lastBrace, lastBracket);
            if (end !== -1) {
                const repaired = text.slice(0, end + 1);
                try {
                    const parsed = JSON.parse(repaired);
                    // Normalize ingredients: ensure item is a string, not an object
                    const normalizedRecipes = Array.isArray(parsed) ? parsed : [parsed];
                    const normalized = normalizedRecipes.map((recipe: any) => ({
                        ...recipe,
                        ingredients: (recipe.ingredients || []).map((ing: any) => ({
                            ...ing,
                            item: typeof ing.item === 'string' ? ing.item : ing.item?.name || ing.name || '',
                        })),
                    }));
                    return normalized;
                } catch {
                    // fall through to re-throw
                }
            }
            throw new Error('Cannot repair truncated JSON');
        }
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
                            if (!parsedOk || usesRequestedIngredients(retryRecipes, ingredients)) {
                                recipes = retryRecipes;
                                parsedOk = true;
                            }
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
