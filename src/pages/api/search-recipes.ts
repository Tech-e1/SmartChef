import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';

/**
 * API handler for searching recipes.
 * Since this app uses localStorage (zustand) for data persistence,
 * this endpoint returns an empty result set.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const query = req.query.query as string;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        // Since we don't use a database, recipes are stored in localStorage via zustand.
        // We return an empty array as there's no database to search.
        // The frontend (usePagination hook) manages recipe state via the zustand store.
        const totalRecipes = 0;
        const totalPages = 1;
        const currentPage = Number(req.query.page) || 1;

        return res.status(200).json({
            recipes: [],
            totalRecipes,
            totalPages,
            currentPage,
            popularTags: [],
        });

    } catch (error) {
        console.error('Error searching recipes:', error);
        return res.status(500).json({ error: 'Failed to fetch search results' });
    }
};

// Apply middleware for authentication & allowed methods
export default apiMiddleware(['GET'], handler);