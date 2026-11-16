import { render, screen } from '@testing-library/react';
import { ActionPopover } from '../../../src/components/Recipe_Display/ActionPopover';
import { ExtendedRecipe } from '@/types/smartchef';

const mockRecipe: ExtendedRecipe = {
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
};

test('ActionPopover renders', () => {
  const handlers = {
    handleClone: jest.fn(),
    handleCopy: jest.fn(),
    handlePlayRecipe: jest.fn(),
    deleteDialog: jest.fn(),
    deleteRecipe: jest.fn(),
  };
  const states = {
    hasAudio: false,
    isLoadingAudio: false,
    isPlayingAudio: false,
    linkCopied: false,
    isDeleteDialogOpen: false,
  };
  render(
    <ActionPopover
      handlers={handlers}
      states={states}
      data={{
        recipe: mockRecipe,
        buttonType: <span>Button</span>,
      }}
    />
  );
  expect(screen.getByText('Clone Ingredients')).toBeInTheDocument();
});