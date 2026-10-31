import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import ChatBox from '../../src/components/ChatBox';

describe('ChatBox', () => {
  test('renders the chat box', () => {
    render(<ChatBox recipeId="test123" />);
    expect(screen.getByText('ChatBox')).toBeInTheDocument();
  });
});