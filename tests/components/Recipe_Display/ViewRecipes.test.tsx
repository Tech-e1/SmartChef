import ViewRecipes from '../../../src/components/Recipe_Display/ViewRecipes';
import { render, screen } from '@testing-library/react';
import { ExtendedRecipe } from '@/types/smartchef';

const mockRecipes: ExtendedRecipe[] = [
  {
    id: '1',
    title: 'Test Recipe',
    dish_type: 'main',
    primary_ingredient: 'chicken',
    cuisine: 'Italian',
    servings: 4,
    prep_minutes: 15,
    cook_minutes: 30,
    difficulty: 'easy' as const,
    dietary_tags: ['healthy'],
    ingredients: [{ quantity: 2, unit: 'pcs', item: 'chicken breast' }],
    steps: ['Step 1', 'Step 2'],
    notes: 'Test notes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    owner: { _id: 'user1', name: 'Test User', image: '' },
    likedBy: [],
  },
];

test('ViewRecipes renders', () => {
  const handleRecipeListUpdate = jest.fn();
  render(
    <ViewRecipes
      recipes={mockRecipes}
      handleRecipeListUpdate={handleRecipeListUpdate}
    />
  );
  expect(screen.getByText('Test Recipe')).toBeInTheDocument();
});