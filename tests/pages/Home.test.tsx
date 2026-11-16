import Home from '../../src/pages/Home';
import { render, screen } from '@testing-library/react';

test('renders the home page', () => {
  render(<Home />);
  expect(screen.getByText('SmartChef')).toBeInTheDocument();
});