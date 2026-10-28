import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';

/**
 * API handler for fetching paginated recipes.
 * Since this app uses localStorage (zustand) for data persistence,
 * this endpoint returns the recipes stored in the session/localStorage.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Since we don't use a database, recipes are stored in localStorage via zustand.
        // We return an empty array as there's no database to fetch from.
        // The frontend (usePagination hook) manages recipe state via the zustand store.
        const totalRecipes = 0;
        const totalPages = 1;
        const currentPage = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const sortOption = req.query.sortOption as string | undefined;

        // Return empty recipes array with pagination metadata
        // Frontend should use the zustand store (useSmartChef) for actual recipe data
        return res.status(200).json({
            recipes: [],
            totalRecipes,
            totalPages,
            currentPage,
            popularTags: [],
        });

    } catch (error) {
        console.error('Error fetching recipes:', error);
        return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

// Apply middleware for authentication & allowed methods
export default apiMiddleware(['GET'], handler);