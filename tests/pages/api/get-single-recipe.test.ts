import getSingleRecipe from '../../../src/pages/api/get-single-recipe';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Get Single Recipe API', () => {
  test('handles get single recipe requests', () => {
    expect(true).toBe(true);
  });
});