import Profile, { getServerSideProps } from "../../src/pages/Profile";
import { fireEvent, render, screen } from '@testing-library/react';
import { stubRecipeBatch } from "../stub";

describe('Profile', () => {
  test('renders the profile page', () => {
    render(<Profile />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});