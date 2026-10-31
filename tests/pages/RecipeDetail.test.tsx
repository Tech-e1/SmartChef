import RecipeDetail from "../../src/pages/RecipeDetail";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    query: {},
  })),
}));

test('renders the recipe detail page', () => {
    render(<RecipeDetail />);
    expect(screen.getByText('Recipe Detail')).toBeInTheDocument();
});