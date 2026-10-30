import DietaryPreferences from "../../../src/components/Recipe_Creation/DietaryPreferences";
import { fireEvent, render, screen } from '@testing-library/react';

describe('DietaryPreferences', () => {
  test('renders the dietary preferences', () => {
    render(<DietaryPreferences />);
    expect(screen.getByText('Dietary Preferences')).toBeInTheDocument();
  });
});