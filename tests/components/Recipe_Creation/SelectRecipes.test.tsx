import SelectRecipesComponent from "../../../src/components/Recipe_Creation/SelectRecipes";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { stubRecipeBatch } from "../../stub";

test('renders the select recipes', () => {
    render(<SelectRecipesComponent generatedRecipes={stubRecipeBatch} updateSelectedRecipes={jest.fn()} selectedRecipes={[]} handleRecipeSubmit={jest.fn()} />);
    expect(screen.getByText('Select Recipes')).toBeInTheDocument();
});