import Landing from "../../../src/components/Hero_Sections/Landing";
import { render, screen, fireEvent } from '@testing-library/react';
import { signIn } from 'next-auth/react';

describe('Landing', () => {
  test('renders the landing page', () => {
    render(<Landing />);
    expect(screen.getByText(/Welcome to SmartChef/i)).toBeInTheDocument();
  });

  test('renders hero content', () => {
    render(<Landing />);
    expect(screen.getByText(/SmartChef is a recipe management app/i)).toBeInTheDocument();
  });
});