import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import {
  RECIPE_GENERATION_SYSTEM_PROMPT,
  createRecipeUserPrompt,
  NVIDIA_CONFIG,
  GROQ_CONFIG,
} from '@/lib/prompts';

interface AIProviderConfig {
  name: string;
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
  temperature: number;
}

const PROVIDERS: AIProviderConfig[] = [
  {
    name: 'NVIDIA',
    apiKey: NVIDIA_CONFIG.apiKey,
    baseUrl: NVIDIA_CONFIG.baseUrl,
    model: NVIDIA_CONFIG.model,
    temperature: NVIDIA_CONFIG.temperature,
  },
  {
    name: 'Groq',
    apiKey: GROQ_CONFIG.apiKey,
    baseUrl: GROQ_CONFIG.baseUrl,
    model: GROQ_CONFIG.model,
    temperature: GROQ_CONFIG.temperature,
  },
];

/**
 * Calls an OpenAI-compatible chat completions endpoint and returns the assistant's text content.
 * Handles both `content` and `reasoning_content` (some reasoning models put output there).
 */
async function callAI(config: AIProviderConfig, userPrompt: string): Promise<string> {
    if (!config.apiKey) {
        throw new Error(`${config.name} API key is not configured`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    try {
        console.log(`[${config.name}] Calling ${config.baseUrl}/chat/completions with model ${config.model}`);
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
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Extracts a JSON array of recipes from the model's raw text, tolerating markdown fences.
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
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
}

/**
 * Checks whether any generated recipe uses at least one of the requested ingredients.
 */
function usesRequestedIngredients(recipes: any[], ingredients: string[]): boolean {
    const requested = ingredients.map((i) => i.toLowerCase().trim());
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
 * Tries providers in order: NVIDIA → Groq. Falls back to the next provider on any error.
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
                    const strictPrompt = `${userPrompt}\n\nCRITICAL: Respond with valid JSON ONLY (no markdown). The recipe's "ingredients" array MUST contain items from the user's provided list.`;
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
