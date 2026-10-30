import NotificationsPage, { getServerSideProps } from "../../src/pages/NotificationsPage";
import { fireEvent, render, screen } from '@testing-library/react';
import { stubNotifications } from "../stub";

describe('NotificationsPage', () => {
  test('renders the notifications page', () => {
    render(<NotificationsPage />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
});