import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import FloatingActionButtons from '../../src/components/FloatingActionButtons';

test('renders floating action buttons', () => {
  render(<FloatingActionButtons />);
  expect(screen.getByText('Floating Action Buttons')).toBeInTheDocument();
});