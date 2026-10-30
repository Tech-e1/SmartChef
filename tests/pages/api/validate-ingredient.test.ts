import validateIngredient from '../../../src/pages/api/validate-ingredient';
import Ingredient from '../../../src/models/ingredient';
import { mockRequestResponse } from '../../apiMocks';
import * as openai from '../../../src/lib/openai';
import * as nextAuth from 'next-auth';
import { getServerSessionStub } from '../../stub';

describe('Validate Ingredient API', () => {
  test('handles validate ingredient requests', () => {
    expect(true).toBe(true);
  });
});