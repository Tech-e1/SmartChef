import CreateRecipe, { getServerSideProps } from "../../src/pages/CreateRecipe";
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import * as apiCalls from "../../src/utils/utils";

test('renders the create recipe page', () => {
    render(<CreateRecipe recipeCreationData={{ ingredientList: [], reachedLimit: false }} />);
    expect(screen.getByText('Create Recipe')).toBeInTheDocument();
});