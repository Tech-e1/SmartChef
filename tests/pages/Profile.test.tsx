import Profile from '../../src/pages/Profile';
import { render, screen } from '@testing-library/react';

test('renders the profile page', () => {
  render(<Profile profileData={{ recipes: [], AIusage: 0 }} />);
  expect(screen.getByText('Profile')).toBeInTheDocument();
});