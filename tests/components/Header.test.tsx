import Header from "../../src/components/Header";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { signOut } from 'next-auth/react';

test('renders the header', () => {
    render(<Header user={{ name: 'Test User', email: 'test@test.com', image: '' } as any} />);
    expect(screen.getByText('SmartChef')).toBeInTheDocument();
});