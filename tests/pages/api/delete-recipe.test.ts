import deleteRecipe from '../../../src/pages/api/delete-recipe';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/recipe', () => ({ default: jest.fn() }));

test('delete recipe api', () => {
  expect(stubRecipeBatch).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});