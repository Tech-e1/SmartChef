import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import ProfileStickyBanner from '../../../src/components/Profile_Information/ProfileStickyBanner';

test('renders the profile sticky banner', () => {
    render(<ProfileStickyBanner userHasRecipes={true} />);
    expect(screen.getByText('Profile Sticky Banner')).toBeInTheDocument();
});