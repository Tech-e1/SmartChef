import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../src/components/Layout';

describe('Layout', () => {
  test('renders the layout', () => {
    render(<Layout />);
    expect(screen.getByText('SmartChef')).toBeInTheDocument();
  });
});