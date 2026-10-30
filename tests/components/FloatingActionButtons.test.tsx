import { render, screen, fireEvent } from '@testing-library/react';
import FloatingActionButtons from '../../src/components/FloatingActionButtons';

describe('FloatingActionButtons', () => {
  test('renders the floating action buttons', () => {
    render(<FloatingActionButtons />);
    expect(screen.getByTestId('floating-action-button')).toBeInTheDocument();
  });
});