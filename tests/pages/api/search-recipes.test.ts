import searchRecipes from '../../../src/pages/api/search-recipes';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { getServerSessionStub, stub_recipe_1 } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/recipe', () => ({ default: jest.fn() }));

test('search recipes api', () => {
  expect(getServerSessionStub).toBeDefined();
  expect(stub_recipe_1).toBeDefined();
});