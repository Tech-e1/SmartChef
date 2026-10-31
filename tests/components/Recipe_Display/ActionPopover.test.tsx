import { render, screen } from '@testing-library/react';
import { fireEvent, within } from '@testing-library/dom';
import { ActionPopover } from '../../../src/components/Recipe_Display/ActionPopover';
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

test('renders the action popover', () => {
    render(<ActionPopover
        handlers={{
            handleClone: jest.fn(),
            handleCopy: jest.fn(),
            handlePlayRecipe: jest.fn(),
            deleteDialog: jest.fn(),
            deleteRecipe: jest.fn(),
        }}
        states={{
            hasAudio: false,
            isLoadingAudio: false,
            isPlayingAudio: false,
            linkCopied: false,
            isDeleteDialogOpen: false,
        }}
        data={{
            recipe: mockRecipe,
            buttonType: <span>Menu</span>,
        }}
    />);
    expect(screen.getByText('Action Popover')).toBeInTheDocument();
});