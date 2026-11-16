import { render, screen } from '@testing-library/react';

test('openai renders', () => {
  render(<div>openai</div>);
  expect(screen.getByText('openai')).toBeInTheDocument();
});