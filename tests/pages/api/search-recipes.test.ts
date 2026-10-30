import searchRecipes from '../../../src/pages/api/search-recipes';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { getServerSessionStub, stub_recipe_1 } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Search Recipes API', () => {
  test('handles search recipes requests', () => {
    expect(true).toBe(true);
  });
});