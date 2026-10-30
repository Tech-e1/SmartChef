import IngredientForm from "../../../src/components/Recipe_Creation/IngredientForm";
import { fireEvent, render, screen } from '@testing-library/react';

describe('IngredientForm', () => {
  test('renders the ingredient form', () => {
    render(<IngredientForm />);
    expect(screen.getByText('Ingredient Form')).toBeInTheDocument();
  });
});