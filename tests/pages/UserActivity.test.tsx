import UserActivityPage from "../../src/pages/UserActivity";
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import * as apiCalls from "../../src/utils/utils";

test('renders the user activity page', () => {
    render(<UserActivityPage />);
    expect(screen.getByText('User Activity')).toBeInTheDocument();
});