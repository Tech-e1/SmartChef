import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import Notifications from '../../src/components/Notifications';
import { useSession } from '@/contexts/SessionContext';

jest.mock('@/contexts/SessionContext', () => ({
  useSession: jest.fn(() => ({ notifications: [], markAsRead: jest.fn() })),
}));

test('renders notifications', () => {
    render(<Notifications />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
});