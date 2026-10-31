import ViewRecipes from "../../../src/components/Recipe_Display/ViewRecipes";
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import * as apiCalls from "../../../src/utils/utils";
import { Recipe } from '@/types/smartchef';

const mockRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Test Recipe',
    dish_type: 'main',
    primary_ingredient: 'chicken',
    cuisine: 'Italian',
    servings: 4,
    prep_minutes: 15,
    cook_minutes: 30,
    difficulty: 'easy',
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

test('renders the view recipes', () => {
    render(<ViewRecipes recipes={mockRecipes} handleRecipeListUpdate={jest.fn()} />);
    expect(screen.getByText('View Recipes')).toBeInTheDocument();
});