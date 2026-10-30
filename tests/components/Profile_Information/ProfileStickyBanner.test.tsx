import { render, screen, fireEvent } from '@testing-library/react';
import ProfileStickyBanner from '../../../src/components/Profile_Information/ProfileStickyBanner';

describe('ProfileStickyBanner', () => {
  test('renders the profile sticky banner', () => {
    render(<ProfileStickyBanner />);
    expect(screen.getByText('Profile Sticky Banner')).toBeInTheDocument();
  });
});