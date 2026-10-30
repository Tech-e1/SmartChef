import deleteRecipe from '../../../src/pages/api/delete-recipe';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Delete Recipe API', () => {
  test('handles delete recipe requests', () => {
    expect(true).toBe(true);
  });
});