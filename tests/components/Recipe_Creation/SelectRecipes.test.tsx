import SelectRecipesComponent from "../../../src/components/Recipe_Creation/SelectRecipes";
import { fireEvent, render, screen } from '@testing-library/react';
import { stubRecipeBatch } from "../../stub";

describe('SelectRecipes', () => {
  test('renders the select recipes', () => {
    render(<SelectRecipesComponent />);
    expect(screen.getByText('Select Recipes')).toBeInTheDocument();
  });
});