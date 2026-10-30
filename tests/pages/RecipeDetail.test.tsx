import RecipeDetail from "../../src/pages/RecipeDetail";
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

describe('RecipeDetail', () => {
  test('renders the recipe detail page', () => {
    render(<RecipeDetail />);
    expect(screen.getByText('Recipe Detail')).toBeInTheDocument();
  });
});