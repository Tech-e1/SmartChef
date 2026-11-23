import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import {
  RECIPE_GENERATION_SYSTEM_PROMPT,
  createRecipeUserPrompt,
  OLLAMA_CONFIG,
} from '@/lib/prompts';

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls the local Ollama API and returns the assistant's text content.
 * Ollama runs entirely on the user's device — no external API keys or cloud services required.
 * Retries once on failure.
 */
async function callOllama(userPrompt: string): Promise<string> {
    const endpoint = `${OLLAMA_CONFIG.endpoint}/api/chat`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for local inference

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            console.log(`[Ollama] Calling ${endpoint} with model ${OLLAMA_CONFIG.model} (attempt ${attempt + 1})`);
            const startTime = Date.now();
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: OLLAMA_CONFIG.model,
                    messages: [
                        { role: 'system', content: RECIPE_GENERATION_SYSTEM_PROMPT },
                        { role: 'user', content: userPrompt },
                    ],
                    stream: false,
                    options: {
                        temperature: OLLAMA_CONFIG.temperature,
                        num_predict: OLLAMA_CONFIG.numPredictions,
                    },
                }),
                signal: controller.signal,
            });
            const duration = Date.now() - startTime;
            console.log(`[Ollama] Response received: status=${response.status} in ${duration}ms`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Ollama] API error:`, errorText);
                throw new Error(`Ollama API responded with status ${response.status}`);
            }

            const data = await response.json();
            const content = data.message?.content || '';
            console.log(`[Ollama] Content length:`, content?.length || 0);
            if (!content || !content.trim()) {
                console.error(`[Ollama] Empty content. Full data:`, JSON.stringify(data).slice(0, 2000));
            }
            return content;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw new Error('Ollama request failed after retries');
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
 * API handler for generating recipes using only local Ollama AI.
 * No external API keys or cloud services required — everything runs on the user's device.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { ingredients, dietaryPreferences } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        const userPrompt = createRecipeUserPrompt(ingredients, dietaryPreferences);

        let raw: string;
        try {
            raw = await callOllama(userPrompt);
        } catch (error: any) {
            return res.status(500).json({
                error: `Ollama connection failed: ${error.message}. Make sure Ollama is running locally at ${OLLAMA_CONFIG.endpoint}.`,
            });
        }

        let recipes: any[] = [];
        let parsedOk = false;

        if (raw && raw.trim()) {
            try {
                recipes = parseRecipes(raw);
                parsedOk = true;
            } catch (parseError) {
                console.error('[Ollama] Failed to parse response as JSON:', parseError);
            }
        }

        const needsRetry = !parsedOk || !usesRequestedIngredients(recipes, ingredients);
        if (needsRetry) {
            console.warn('[Ollama] Retrying with stricter prompt...');
            const strictPrompt = `${userPrompt}\n\nCRITICAL: You MUST use ONLY ingredients from the user's provided list. Do NOT add, substitute, or invent any ingredient not on the list. Every ingredient item in your JSON must match one of the user's provided ingredients exactly. Respond with valid JSON ONLY (no markdown, no code blocks, no explanations).`;
            const retryRaw = await callOllama(strictPrompt);
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
                } catch (retryParseError) {
                    console.error('[Ollama] Failed to parse retry response as JSON:', retryParseError);
                }
            }
        }

        if (parsedOk) {
            res.status(200).json({ recipes: JSON.stringify(recipes) });
            return;
        }

        res.status(500).json({
            error: 'Ollama returned invalid recipe JSON. Make sure you are using a capable model (e.g., llama3.1:8b-instruct or larger).',
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to generate recipes' });
    }
};

export default apiMiddleware(['POST'], handler);