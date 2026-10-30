import Home from "../../src/pages/Home";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { stubRecipeBatch } from "../stub";

describe('Home', () => {
  test('renders the home page', () => {
    render(<Home />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});