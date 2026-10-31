import Landing from "../../../src/components/Hero_Sections/Landing";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { signIn } from 'next-auth/react';

test('renders landing', () => {
    render(<Landing />);
    expect(screen.getByText('SmartChef')).toBeInTheDocument();
});