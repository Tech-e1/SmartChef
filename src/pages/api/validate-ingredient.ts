import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';

/**
 * API handler for validating and adding a new ingredient.
 * Since this app uses localStorage (zustand) for data persistence,
 * ingredients are stored client-side via the zustand store.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Extract ingredient name from the request body
        const { ingredientName } = req.body;
        const userId = session.user.id;
        const trimmedIngredientName = typeof ingredientName === 'string' ? ingredientName.trim() : '';

        // Validate ingredient name input
        if (!trimmedIngredientName) {
            return res.status(400).json({ error: 'Ingredient name is required' });
        }

        // Since we don't use a database, ingredients are stored client-side via the zustand store.
        // This endpoint is kept for API compatibility but does not persist to a database.
        return res.status(200).json({
            message: 'Ingredient validation skipped (no database available)',
            suggested: []
        });

    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        return res.status(500).json({ error: 'Failed to validate ingredient' });
    }
};

export default apiMiddleware(['POST'], handler);