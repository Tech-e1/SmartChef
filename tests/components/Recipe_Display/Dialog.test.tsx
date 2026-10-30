import RecipeDisplayModal from "../../../src/components/Recipe_Display/Dialog";
import { render, screen, fireEvent } from '@testing-library/react';
import * as apiCalls from "../../../src/utils/utils";

describe('Dialog', () => {
  test('renders the dialog', () => {
    render(<RecipeDisplayModal />);
    expect(screen.getByText('Dialog')).toBeInTheDocument();
  });
});