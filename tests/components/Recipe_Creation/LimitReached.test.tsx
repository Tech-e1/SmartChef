import LimitReached from "../../../src/components/Recipe_Creation/LimitReached";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';

test('renders the limit reached', () => {
    render(<LimitReached />);
    expect(screen.getByText('Limit Reached')).toBeInTheDocument();
});