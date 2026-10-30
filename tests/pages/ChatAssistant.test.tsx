import ChatAssistantPage from "../../src/pages/ChatAssistant";
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

describe('ChatAssistantPage', () => {
  test('renders the chat assistant page', () => {
    render(<ChatAssistantPage />);
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
  });
});