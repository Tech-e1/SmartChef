import StepComponent from "../../../src/components/Recipe_Creation/StepComponent";
import { render, screen } from '@testing-library/react';
import { stubRecipeBatch } from "../../stub";

test('renders the step component', () => {
    render(<StepComponent step={stubRecipeBatch[0]} ingredientList={[]} ingredients={[]} updateIngredients={jest.fn()} generatedRecipes={[]} updateSelectedRecipes={jest.fn()} selectedRecipes={[]} handleRecipeSubmit={jest.fn()} />);
    expect(screen.getByText('Step Component')).toBeInTheDocument();
});