import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import {RECIPE_GENERATION_SYSTEM_PROMPT,createRecipeUserPrompt,OLLAMA_CONFIG,} from '@/lib/prompts';

/**
 * API handler for generating recipes based on provided ingredients and dietary preferences.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Extract ingredients and dietary preferences from request body
        const { ingredients, dietaryPreferences } = req.body;

        // Validate ingredients input
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        // Generate recipes using OpenAI API
        
	const prompt = `${RECIPE_GENERATION_SYSTEM_PROMPT}\n\n${createRecipeUserPrompt(ingredients, dietaryPreferences)}`;
	const response = await fetch(`${OLLAMA_CONFIG.endpoint}/api/generate`, {
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

        // Respond with the generated recipes
        res.status(200).json(response);
    } catch (error) {
        // Handle any errors that occur during recipe generation
        console.error(error);
        res.status(500).json({ error: 'Failed to generate recipes' });
    }
};

export default apiMiddleware(['POST'], handler);
