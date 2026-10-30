import CreateRecipe, { getServerSideProps } from "../../src/pages/CreateRecipe";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as apiCalls from "../../src/utils/utils";

describe('CreateRecipe', () => {
  test('renders the create recipe page', () => {
    render(<CreateRecipe />);
    expect(screen.getByText('Create Recipe')).toBeInTheDocument();
  });
});