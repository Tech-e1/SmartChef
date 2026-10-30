import UserActivityPage from "../../src/pages/UserActivity";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as apiCalls from "../../src/utils/utils";

describe('UserActivityPage', () => {
  test('renders the user activity page', () => {
    render(<UserActivityPage />);
    expect(screen.getByText('User Activity')).toBeInTheDocument();
  });
});