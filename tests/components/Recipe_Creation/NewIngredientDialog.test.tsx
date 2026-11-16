import { render, screen } from '@testing-library/react';
import NewIngredientDialog from '../../src/components/Recipe_Creation/NewIngredientDialog';

test('renders the new ingredient dialog', () => {
  const ingredientList = [];
  const updateIngredientList = jest.fn();
  render(<NewIngredientDialog ingredientList={ingredientList} updateIngredientList={updateIngredientList} />);
  expect(screen.getByText('New Ingredient Dialog')).toBeInTheDocument();
});