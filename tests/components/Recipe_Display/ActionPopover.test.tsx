import { render, screen, fireEvent, within } from '@testing-library/react';
import { ActionPopover } from '../../../src/components/Recipe_Display/ActionPopover';

describe('ActionPopover', () => {
  test('renders the action popover', () => {
    render(<ActionPopover />);
    expect(screen.getByText('Action Popover')).toBeInTheDocument();
  });
});