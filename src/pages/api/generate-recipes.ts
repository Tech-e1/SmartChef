import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { RECIPE_GENERATION_SYSTEM_PROMPT, createRecipeUserPrompt, NVIDIA_CONFIG } from '@/lib/prompts';

/**
 * Calls the NVIDIA NIM chat completions endpoint and returns the assistant's text content.
 * Handles both `content` and `reasoning_content` (some reasoning models put output there).
 */
async function callNvidia(userPrompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    try {
        console.log(`[NVIDIA] Calling ${NVIDIA_CONFIG.baseUrl}/chat/completions with model ${NVIDIA_CONFIG.model}`);
        const startTime = Date.now();
        const response = await fetch(`${NVIDIA_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NVIDIA_CONFIG.apiKey}`,
            },
            body: JSON.stringify({
                model: NVIDIA_CONFIG.model,
                messages: [
                    { role: 'system', content: RECIPE_GENERATION_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt },
                ],
                temperature: NVIDIA_CONFIG.temperature,
                max_tokens: 4096,
            }),
            signal: controller.signal,
        });
        console.log(`[NVIDIA] Response received: status=${response.status} in ${Date.now() - startTime}ms`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('NVIDIA API error:', errorText);
            throw new Error(`NVIDIA API responded with status ${response.status}`);
        }

        const data = await response.json();
        const message = data.choices?.[0]?.message || {};
        const content = message.content || message.reasoning_content || '';
        console.log('[NVIDIA] Response keys:', Object.keys(data), '| content length:', content?.length || 0);
        if (!content || !content.trim()) {
            console.error('[NVIDIA] Empty content. Full data:', JSON.stringify(data).slice(0, 2000));
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
    // Strip markdown code fences if present
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
        text = fenceMatch[1].trim();
    }
    // Fall back to the first {...} or [...] block
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
 * Calls NVIDIA NIM AI models using an API key, then returns the generated recipes as a JSON string
 * so they stay local in the client app (no external storage).
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { ingredients, dietaryPreferences } = req.body;

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        if (!NVIDIA_CONFIG.apiKey) {
            return res.status(500).json({ error: 'NVIDIA_API_KEY is not configured' });
        }

        const userPrompt = createRecipeUserPrompt(ingredients, dietaryPreferences);

        // First attempt
        let raw = await callNvidia(userPrompt);
        let recipes: any[] = [];
        let parsedOk = false;

        if (raw && raw.trim()) {
            try {
                recipes = parseRecipes(raw);
                parsedOk = true;
            } catch (parseError) {
                console.error('Failed to parse NVIDIA response as JSON:', parseError);
            }
        }

        // Retry once if the response was empty/unparseable or didn't use the requested ingredients
        const needsRetry = !parsedOk || !usesRequestedIngredients(recipes, ingredients);
        if (needsRetry) {
            console.warn('[NVIDIA] Retrying with stricter prompt (empty/unparseable or missing ingredients)...');
            const strictPrompt = `${userPrompt}\n\nCRITICAL: Respond with valid JSON ONLY (no markdown). The recipe's "ingredients" array MUST contain items from the user's provided list.`;
            const retryRaw = await callNvidia(strictPrompt);
            if (retryRaw && retryRaw.trim()) {
                try {
                    const retryRecipes = parseRecipes(retryRaw);
                    if (!parsedOk || usesRequestedIngredients(retryRecipes, ingredients)) {
                        recipes = retryRecipes;
                        parsedOk = true;
                    }
                } catch (retryParseError) {
                    console.error('Failed to parse NVIDIA retry response as JSON:', retryParseError);
                }
            }
        }

        if (!parsedOk) {
            return res.status(500).json({ error: 'Failed to parse generated recipes' });
        }

        res.status(200).json({ recipes: JSON.stringify(recipes) });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('NVIDIA API request timed out after 60 seconds');
            return res.status(500).json({ error: 'Recipe generation timed out. The NVIDIA API is slow or unreachable. Please try again.' });
        }
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to generate recipes' });
    }
};

export default apiMiddleware(['POST'], handler);
