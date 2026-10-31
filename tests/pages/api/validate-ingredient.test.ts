import validateIngredient from '../../../src/pages/api/validate-ingredient';
import Ingredient from '../../../src/models/ingredient';
import { mockRequestResponse } from '../../apiMocks';
import * as openai from '../../../src/lib/openai';
import * as nextAuth from 'next-auth';
import { getServerSessionStub } from '../../stub';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/ingredient', () => ({ default: jest.fn() }));
jest.mock('../../../src/lib/openai', () => ({}));

test('validate ingredient api', () => {
  expect(getServerSessionStub).toBeDefined();
});