import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';

/**
 * POST /api/chat-assistant
 * Handles stateless chat queries per recipe context.
 * Since this app uses localStorage (zustand) for data persistence,
 * the recipe context should be passed from the client.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { recipeId, message, history, recipeContext } = req.body;

        if (!recipeId || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Since we don't use a database, the recipe context must be passed from the client
        // (from the zustand store). If not provided, return an error.
        if (!recipeContext) {
            return res.status(400).json({ error: 'Recipe context required (no database available)' });
        }

        // For now, return a placeholder response
        // In a real implementation, this would call an AI service with the recipe context
        return res.status(200).json({ 
            reply: 'Chat assistant not fully implemented without database. Recipe context received.',
            totalTokens: 0 
        });

    } catch (err) {
        console.error('Chat Assistant Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default apiMiddleware(['POST'], handler);