import getIngredients from '../../../src/pages/api/get-ingredients';
import Ingredient from '../../../src/models/ingredient';
import aigenerated from '../../../src/models/aigenerated';
import { mockRequestResponse } from '../../apiMocks';
import { ingredientListStub, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/ingredient', () => ({ default: jest.fn() }));
jest.mock('../../../src/models/aigenerated', () => ({ default: jest.fn() }));

test('get ingredients api', () => {
  expect(ingredientListStub).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});