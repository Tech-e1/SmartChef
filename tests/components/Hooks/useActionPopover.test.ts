import { renderHook } from '@testing-library/react';
import { useActionPopover } from '../../../src/components/Recipe_Display/ActionPopover';
import { Recipe } from '@/types/smartchef';

const mockRecipe: Recipe = {
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
};

test('useActionPopover hook', () => {
    const { result } = renderHook(() => useActionPopover(mockRecipe, () => {}));
    expect(result.current).toBeDefined();
});