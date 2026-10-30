import { useSession } from "next-auth/react";
import Hero from "../../src/pages/Hero";
import { fireEvent, render, screen } from '@testing-library/react';

describe('Hero', () => {
  test('renders the hero page', () => {
    render(<Hero />);
    expect(screen.getByText('Hero')).toBeInTheDocument();
  });
});