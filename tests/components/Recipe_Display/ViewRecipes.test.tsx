import ViewRecipes from "../../../src/components/Recipe_Display/ViewRecipes";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as apiCalls from "../../../src/utils/utils";

describe('ViewRecipes', () => {
  test('renders the view recipes', () => {
    render(<ViewRecipes />);
    expect(screen.getByText('View Recipes')).toBeInTheDocument();
  });
});