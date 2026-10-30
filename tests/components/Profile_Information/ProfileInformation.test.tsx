import ProfileInformation from "../../../src/components/Profile_Information/ProfileInformation";
import { useSession } from "next-auth/react";
import { render, screen, fireEvent } from '@testing-library/react';

describe('ProfileInformation', () => {
  test('renders the profile information', () => {
    // Mock useSession hook
    jest.spyOn(useSession, 'useSession').mockReturnValue({ data: { user: { name: 'Test User', email: 'test@example.com', image: '/profile.jpg' } } });
    
    render(<ProfileInformation />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});