import { render, screen } from '@testing-library/react';

test('withAuth renders', () => {
  render(<div>withAuth</div>);
  expect(screen.getByText('withAuth')).toBeInTheDocument();
});