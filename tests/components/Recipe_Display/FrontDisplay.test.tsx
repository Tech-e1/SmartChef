import FrontDisplay from "../../../src/components/Recipe_Display/FrontDisplay";
import { render, screen, fireEvent } from '@testing-library/react';
import * as apiCalls from "../../../src/utils/utils";

describe('FrontDisplay', () => {
  test('renders the front display', () => {
    render(<FrontDisplay />);
    expect(screen.getByText('Front Display')).toBeInTheDocument();
  });
});