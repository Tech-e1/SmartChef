import { useSession } from "next-auth/react";
import Hero from "../../src/pages/Hero";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ data: { user: { name: 'Test User' } } })),
}));

test('renders the hero page', () => {
    render(<Hero />);
    expect(screen.getByText('SmartChef')).toBeInTheDocument();
});