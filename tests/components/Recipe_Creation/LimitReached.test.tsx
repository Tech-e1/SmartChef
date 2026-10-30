import LimitReached from "../../../src/components/Recipe_Creation/LimitReached";
import { fireEvent, render, screen } from '@testing-library/react';

describe('LimitReached', () => {
  test('renders the limit reached', () => {
    render(<LimitReached />);
    expect(screen.getByText('Limit Reached')).toBeInTheDocument();
  });
});