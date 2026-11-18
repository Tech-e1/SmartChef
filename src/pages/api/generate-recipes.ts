import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';

/** Offline recipe generator for the self-hosted app. No external LLM dependency. */
function generateRecipes(
  ingredients: { name: string }[],
  dietaryPreferences: string[]
): any[] {
  const dietary = dietaryPreferences.join(', ') || 'none';
  return ingredients.map((ing, idx) => ({
    id: `recipe-${idx}`,
    title: `${ing.name} ${idx % 3 === 0 ? 'Delight' : idx % 3 === 1 ? 'Special' : 'Classic'}`,
    dish_type: ing.name.toLowerCase(),
    primary_ingredient: ing.name.toLowerCase(),
    cuisine: dietary !== 'none' ? 'Generic' : null,
    servings: 4,
    prep_minutes: 10,
    cook_minutes: 20,
    difficulty: 'easy',
    dietary_tags: dietaryPreferences,
    ingredients: [
      { quantity: 2, unit: 'cup', item: ing.name },
      { quantity: 1, unit: 'tbsp', item: 'olive oil' },
      { quantity: 1, unit: 'tsp', item: 'salt' },
      { quantity: 0.5, unit: 'tsp', item: 'black pepper' },
    ],
    steps: [
      `Prepare the ${ing.name} by washing and chopping it as needed.`,
      'Heat olive oil in a pan over medium heat.',
      `Add the ${ing.name} and cook until tender, stirring occasionally.`,
      'Season with salt and black pepper to taste.',
      'Serve warm and enjoy.',
    ],
    notes: `A simple ${dietary} recipe featuring ${ing.name}.`,
  }));
}

/**
 * API handler for generating recipes based on provided ingredients and dietary preferences.
 * Offline self-hosted app: generates recipes locally instead of calling an external LLM.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
  try {
    // Extract ingredients and dietary preferences from request body
    const { ingredients, dietaryPreferences } = req.body;

    // Validate ingredients input
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    const recipes = generateRecipes(ingredients, dietaryPreferences);

    // Respond with the generated recipes as a JSON string (matching caller's JSON.parse expectation)
    res.status(200).json({ recipes: JSON.stringify(recipes) });
  } catch (error) {
    // Handle any errors that occur during recipe generation
    console.error(error);
    res.status(500).json({ error: 'Failed to generate recipes' });
  }
};

export default apiMiddleware(['POST'], handler);
