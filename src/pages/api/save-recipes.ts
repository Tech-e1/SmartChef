import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';

/**
 * API handler for saving recipes.
 * Since this app uses localStorage (zustand) for data persistence,
 * recipes are saved client-side via the zustand store.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Since we don't use a database, recipes are saved client-side via the zustand store.
        // This endpoint is kept for API compatibility but does not persist to a database.
        return res.status(200).json({ status: 'Recipes saved locally via zustand store' });

    } catch (error) {
        console.error('Failed to save recipes:', error);
        res.status(500).json({ error: 'Failed to save recipes' });
    }
};

export default apiMiddleware(['POST'], handler);