import StepComponent from '../../../src/components/Recipe_Creation/StepComponent';
import { render, screen } from '@testing-library/react';

test('renders the step component', () => {
  render(<StepComponent step={0} ingredientList={[]} ingredients={[]} updateIngredients={jest.fn()} preferences={[]} updatePreferences={jest.fn()} editInputs={jest.fn()} handleIngredientSubmit={jest.fn()} generatedRecipes={[]} />);
  expect(screen.getByText('Step Component')).toBeInTheDocument();
});
