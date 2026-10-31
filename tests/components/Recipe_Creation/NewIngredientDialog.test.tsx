import * as apiCalls from "../../../src/utils/utils";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import NewIngredientDialog from "../../../src/components/Recipe_Creation/NewIngredientDialog";

test('renders the new ingredient dialog', () => {
    render(<NewIngredientDialog />);
    expect(screen.getByText('New Ingredient Dialog')).toBeInTheDocument();
});