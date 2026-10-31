import Profile, { getServerSideProps } from "../../src/pages/Profile";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { stubRecipeBatch } from "../stub";

test('renders the profile page', () => {
    render(<Profile profileData={stubRecipeBatch} />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
});