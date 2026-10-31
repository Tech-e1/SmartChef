import withAuth from "../../src/components/withAuth";
import { useSession } from "next-auth/react";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: { user: { name: 'Test User' } } })),
}));

test('renders the withAuth component', () => {
    const TestComponent = withAuth(() => <div>Protected Content</div>);
    render(<TestComponent />);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
});