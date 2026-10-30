import * as apiCalls from "../../../src/utils/utils";
import { fireEvent, render, screen } from '@testing-library/react';

describe('NewIngredientDialog', () => {
  test('renders the new ingredient dialog', () => {
    render(<NewIngredientDialog />);
    expect(screen.getByText('New Ingredient Dialog')).toBeInTheDocument();
  });
});