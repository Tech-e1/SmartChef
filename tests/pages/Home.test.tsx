import Home from "../../src/pages/Home";
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import { stubRecipeBatch } from "../stub";

test('renders the home page', () => {
    render(<Home recipes={stubRecipeBatch} />);
    expect(screen.getByText('SmartChef')).toBeInTheDocument();
});