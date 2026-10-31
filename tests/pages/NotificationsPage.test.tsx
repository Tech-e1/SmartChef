import NotificationsPage, { getServerSideProps } from "../../src/pages/NotificationsPage";
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import { stubNotifications } from "../stub";

test('renders the notifications page', () => {
    render(<NotificationsPage initialNotifications={stubNotifications} />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
});