import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import {RECIPE_GENERATION_SYSTEM_PROMPT, createRecipeUserPrompt, OLLAMA_CONFIG} from '@/lib/prompts';

/**
 * API handler for generating recipes based on provided ingredients and dietary preferences.
 * Calls the local Ollama AI model, then returns the generated recipes as a JSON string
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

        const prompt = `${RECIPE_GENERATION_SYSTEM_PROMPT}\n\n${createRecipeUserPrompt(ingredients, dietaryPreferences)}`;

        // Call the local Ollama AI model
        const ollamaResponse = await fetch(`${OLLAMA_CONFIG.endpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_CONFIG.model,
                prompt,
                stream: false,
                options: {
                    temperature: OLLAMA_CONFIG.temperature,
                    num_predict: OLLAMA_CONFIG.numPredictions,
                },
            }),
        });

        if (!ollamaResponse.ok) {
            throw new Error(`Ollama responded with status ${ollamaResponse.status}`);
        }

        const ollamaData = await ollamaResponse.json();
        const responseText = ollamaData.response || '';

        // The model is instructed to return pure JSON. Parse it; fall back gracefully if it doesn't.
        let recipes: any[] = [];
        try {
            recipes = JSON.parse(responseText);
            if (!Array.isArray(recipes)) {
                recipes = [recipes];
            }
        } catch (parseError) {
            console.error('Failed to parse Ollama response as JSON:', parseError);
            return res.status(500).json({ error: 'Failed to parse generated recipes' });
        }

        // Respond with the generated recipes as a JSON string (caller does JSON.parse)
        res.status(200).json({ recipes: JSON.stringify(recipes) });
    } catch (error) {
        // Handle any errors that occur during recipe generation
        console.error(error);
        res.status(500).json({ error: 'Failed to generate recipes' });
    }
};

export default apiMiddleware(['POST'], handler);
