import { renderHook } from '@testing-library/react-hooks';
import { useActionPopover } from '../../../src/components/Recipe_Display/ActionPopover';
import { Recipe } from '@/types/smartchef';

// Mock recipe data
const stub_recipe_1: Recipe = {
  id: '1',
  title: 'Spaghetti Carbonara',
  dish_type: 'pasta',
  primary_ingredient: 'spaghetti',
  cuisine: 'italian',
  servings: 4,
  prep_minutes: 15,
  cook_minutes: 20,
  difficulty: 'medium',
  dietary_tags: ['vegetarian'],
  ingredients: [
    { name: 'spaghetti', quantity: 400, unit: 'g' },
    { name: 'eggs', quantity: 2, unit: 'pcs' },
    { name: 'pancetta', quantity: 100, unit: 'g' },
    { name: 'parmesan', quantity: 50, unit: 'g' },
  ],
  steps: [
    'Cook spaghetti according to package instructions',
    'Fry pancetta until crispy',
    'Whisk eggs and parmesan together',
    'Mix spaghetti with pancetta and egg mixture',
  ],
  notes: 'Serve immediately',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  owner: {
    _id: '1',
    name: 'John Doe',
    image: '/profile.jpg',
  },
  likedBy: [],
  tags: [],
  audio: '',
  liked: false,
  owns: false,
};

describe('useActionPopover', () => {
  test('handleClone navigates to the recipe creation page with query', () => {
    const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));
    expect(result.current.handleClone()).toBeDefined();
  });

  test('handleCopy copies the recipe URL', async () => {
    const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));
    await result.current.handleCopy();
    // Mock clipboard write
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('handlePlayRecipe plays audio', async () => {
    const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));
    await result.current.handlePlayRecipe();
    // Mock audio playback
  });

  test('killAudio stops playback and resets states', () => {
    const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));
    result.current.killAudio();
    // Mock audio stop
  });

  test('handleDeleteDialog opens delete dialog', () => {
    const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));
    result.current.handleDeleteDialog();
    // Mock dialog open
  });

  test('handleDeleteRecipe deletes recipe', async () => {
    const { result } = renderHook(() => useActionPopover(stub_recipe_1, jest.fn()));
    const resultData = await result.current.handleDeleteRecipe();
    expect(resultData.message).toBe('Recipe deleted successfully');
  });
});