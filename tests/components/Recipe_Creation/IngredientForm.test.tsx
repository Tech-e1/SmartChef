import IngredientForm from "../../../src/components/Recipe_Creation/IngredientForm";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';

test('renders the ingredient form', () => {
    render(<IngredientForm ingredientList={[]} ingredients={[]} updateIngredients={jest.fn()} generatedRecipes={[]} />);
    expect(screen.getByText('Ingredient Form')).toBeInTheDocument();
});