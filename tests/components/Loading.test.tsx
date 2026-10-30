import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import Loading from '../../src/components/Loading';

describe('Loading', () => {
  test('renders the loading state', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});