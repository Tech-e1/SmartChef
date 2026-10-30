import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatBox from '../../src/components/ChatBox';

describe('ChatBox', () => {
  test('renders the chat box', () => {
    render(<ChatBox />);
    expect(screen.getByText('ChatBox')).toBeInTheDocument();
  });
});