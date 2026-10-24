import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import Recipe from '../../models/recipe';
import aigenerated from '../../models/aigenerated';
import { ExtendedRecipe } from '../../types';
import { CHAT_ASSISTANT_SYSTEM_PROMPT, createChatUserMessage } from '@/lib/prompts';

/**
 * POST /api/chat-assistant
 * Handles stateless chat queries per recipe context using OpenAI.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { recipeId, message, history } = req.body;

        if (!recipeId || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const recipe = await Recipe.findById(recipeId).lean() as unknown as ExtendedRecipe;
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found.' });
        }

        const { reply, totalTokens } = await generateChatResponse(message, recipe, history, session.user.id);
        return res.status(200).json({ reply, totalTokens });
    } catch (err) {
        console.error('Chat Assistant Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default apiMiddleware(['POST'], handler);