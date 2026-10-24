import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import Recipe from '../../models/recipe';
import { filterResults, paginationQueryHelper } from '../../utils/utils';
import { ExtendedRecipe, PaginationQueryType } from '../../types';

/**
 * API handler for fetching paginated recipes with sorting options.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { page, limit, skip, sortOption } = paginationQueryHelper(req.query as unknown as PaginationQueryType);

        // Connect to the database
        await connectDB();

        // Execute the query
        const recipes = await Recipe.find()
            .populate(['owner', 'likedBy', 'comments.user'])
            .skip(skip)
            .limit(limit)
            .lean() as unknown as ExtendedRecipe[];

        const totalRecipes = await Recipe.countDocuments({});
        const popularTags = await Recipe.aggregate([
            { $unwind: "$tags" },
            { $unwind: "$tags.tag" },
            { $group: { _id: "$tags.tag", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        return res.status(200).json({
            recipes: filterResults(recipes, session.user.id),
            totalRecipes,
            totalPages: Math.ceil(totalRecipes / limit),
            currentPage: page,
            popularTags,
        });

    } catch (error) {
        console.error('Error fetching recipes:', error);
        return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

// Apply middleware for authentication & allowed methods
export default apiMiddleware(['GET'], handler);