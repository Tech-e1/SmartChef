import getSingleRecipe from '../../../src/pages/api/get-single-recipe';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/recipe', () => ({ default: jest.fn() }));

test('get single recipe api', () => {
  expect(stubRecipeBatch).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});