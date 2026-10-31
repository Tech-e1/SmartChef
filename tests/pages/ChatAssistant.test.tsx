import ChatAssistantPage from "../../src/pages/ChatAssistant";
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    query: {},
  })),
}));

test('renders chat assistant page', () => {
    render(<ChatAssistantPage />);
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
});