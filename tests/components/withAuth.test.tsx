import withAuth from "../../src/components/withAuth";
import { useSession } from "next-auth/react";
import { render, screen, fireEvent } from '@testing-library/react';

describe('withAuth', () => {
  test('renders the withAuth component', () => {
    render(<withAuth />);
    expect(screen.getByText('withAuth')).toBeInTheDocument();
  });
});