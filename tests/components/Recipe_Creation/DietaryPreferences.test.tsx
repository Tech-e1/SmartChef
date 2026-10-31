import DietaryPreferences from "../../../src/components/Recipe_Creation/DietaryPreferences";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';

test('renders the dietary preferences', () => {
    render(<DietaryPreferences preferences={[]} updatePreferences={jest.fn()} generatedRecipes={[]} />);
    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
});