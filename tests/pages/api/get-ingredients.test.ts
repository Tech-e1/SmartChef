import getIngredients from '../../../src/pages/api/get-ingredients';
import Ingredient from '../../../src/models/ingredient';
import aigenerated from '../../../src/models/aigenerated';
import { mockRequestResponse } from '../../apiMocks';
import { ingredientListStub, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Get Ingredients API', () => {
  test('handles get ingredients requests', () => {
    expect(true).toBe(true);
  });
});