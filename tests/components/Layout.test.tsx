import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    query: {},
  })),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: { user: { name: 'Test User' } } })),
}));

test('renders the layout', () => {
    render(<Layout children={<div>Test Content</div>} />);
    expect(screen.getByText('SmartChef')).toBeInTheDocument();
});