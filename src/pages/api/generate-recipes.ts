import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import {RECIPE_GENERATION_SYSTEM_PROMPT, createRecipeUserPrompt, NVIDIA_CONFIG} from '@/lib/prompts';

/**
 * API handler for generating recipes based on provided ingredients and dietary preferences.
 * Calls NVIDIA NIM AI models using an API key, then returns the generated recipes as a JSON string
 * so they stay local in the client app (no external storage).
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Extract ingredients and dietary preferences from request body
        const { ingredients, dietaryPreferences } = req.body;

        // Validate ingredients input
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        if (!NVIDIA_CONFIG.apiKey) {
            return res.status(500).json({ error: 'NVIDIA_API_KEY is not configured' });
        }

        const prompt = `${RECIPE_GENERATION_SYSTEM_PROMPT}\n\n${createRecipeUserPrompt(ingredients, dietaryPreferences)}`;

        // Call NVIDIA NIM API (OpenAI-compatible chat completions) with a timeout
        const nvidiaController = new AbortController();
        const nvidiaTimeoutId = setTimeout(() => nvidiaController.abort(), 60000);
        let nvidiaResponse: Response;
        try {
            console.log(`[NVIDIA] Calling ${NVIDIA_CONFIG.baseUrl}/chat/completions with model ${NVIDIA_CONFIG.model}`);
            const startTime = Date.now();
            nvidiaResponse = await fetch(`${NVIDIA_CONFIG.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${NVIDIA_CONFIG.apiKey}`,
                },
                body: JSON.stringify({
                    model: NVIDIA_CONFIG.model,
                    messages: [
                        { role: 'system', content: RECIPE_GENERATION_SYSTEM_PROMPT },
                        { role: 'user', content: createRecipeUserPrompt(ingredients, dietaryPreferences) },
                    ],
                    temperature: NVIDIA_CONFIG.temperature,
                    max_tokens: 4096,
                }),
                signal: nvidiaController.signal,
            });
            const duration = Date.now() - startTime;
            console.log(`[NVIDIA] Response received: status=${nvidiaResponse.status} in ${duration}ms`);
        } finally {
            clearTimeout(nvidiaTimeoutId);
        }

        if (!nvidiaResponse.ok) {
            const errorText = await nvidiaResponse.text();
            console.error('NVIDIA API error:', errorText);
            throw new Error(`NVIDIA API responded with status ${nvidiaResponse.status}`);
        }

        const nvidiaData = await nvidiaResponse.json();
        const responseText = nvidiaData.choices?.[0]?.message?.content || '';

        if (!responseText || !responseText.trim()) {
            throw new Error('NVIDIA returned an empty response content');
        }

        // The model is instructed to return pure JSON. Parse it; fall back gracefully if it doesn't.
        let recipes: any[] = [];
        try {
            recipes = JSON.parse(responseText);
            if (!Array.isArray(recipes)) {
                recipes = [recipes];
            }
        } catch (parseError) {
            console.error('Failed to parse NVIDIA response as JSON:', parseError);
            return res.status(500).json({ error: 'Failed to parse generated recipes' });
        }

        // Respond with the generated recipes as a JSON string (caller does JSON.parse)
        res.status(200).json({ recipes: JSON.stringify(recipes) });
    } catch (error: any) {
        // Distinguish timeout/abort from other errors
        if (error.name === 'AbortError') {
            console.error('NVIDIA API request timed out after 60 seconds');
            return res.status(500).json({ error: 'Recipe generation timed out. The NVIDIA API is slow or unreachable. Please try again.' });
        }
        console.error(error);
        res.status(500).json({ error: error.message || 'Failed to generate recipes' });
    }
};

export default apiMiddleware(['POST'], handler);
