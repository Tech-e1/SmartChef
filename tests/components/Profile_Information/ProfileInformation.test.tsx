import ProfileInformation from "../../../src/components/Profile_Information/ProfileInformation";
import { useSession } from "next-auth/react";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: { user: { name: 'Test User' } } })),
}));

test('renders the profile information', () => {
    render(<ProfileInformation recipes={[]} updateSelection={jest.fn()} selectedDisplay="grid" AIusage={0} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
});