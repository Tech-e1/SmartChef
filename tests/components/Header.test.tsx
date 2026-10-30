import Header from "../../src/components/Header";
import { render, screen, fireEvent } from '@testing-library/react';
import { signOut } from 'next-auth/react';

describe('Header', () => {
  test('renders the header', () => {
    render(<Header />);
    expect(screen.getByText('SmartChef')).toBeInTheDocument();
  });

  test('calls signOut on button click', () => {
    const handleSignOut = jest.fn();
    const user = { 
      name: 'Test User', 
      email: 'test@example.com', 
      image: '/profile.jpg' 
    };
    
    const { rerender } = render(<Header user={user} />);
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);
    expect(handleSignOut).toHaveBeenCalled();
  });
});