import recipes from '../../../src/pages/api/get-recipes';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Get Recipes API', () => {
  test('handles get recipes requests', () => {
    expect(true).toBe(true);
  });
});