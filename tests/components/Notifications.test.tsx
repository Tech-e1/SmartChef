import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Notifications from '../../src/components/Notifications';
import { useSmartChef } from '@/contexts/SessionContext';

describe('Notifications', () => {
  const mockNotifications = [
    { _id: '1', read: false, message: 'New recipe added', recipeId: '1', createdAt: '2023-01-01T00:00:00Z' },
    { _id: '2', read: true, message: 'Recipe updated', recipeId: '2', createdAt: '2023-01-02T00:00:00Z' },
  ];

  test('renders notifications', () => {
    // Mock useSmartChef hook
    jest.spyOn(useSmartChef, 'useSmartChef').mockReturnValue({ notifications: mockNotifications });
    
    render(<Notifications />);
    expect(screen.getByText('New recipe added')).toBeInTheDocument();
    expect(screen.getByText('Recipe updated')).toBeInTheDocument();
  });

  test('handles notification close', () => {
    // Mock useSmartChef hook
    jest.spyOn(useSmartChef, 'useSmartChef').mockReturnValue({ notifications: mockNotifications });
    
    render(<Notifications />);
    const closeButton = screen.getByRole('button', { name: /×/ });
    fireEvent.click(closeButton);
    // Mock close action
  });
});