import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Loading from '../../src/components/Loading';

test('renders loading', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
});