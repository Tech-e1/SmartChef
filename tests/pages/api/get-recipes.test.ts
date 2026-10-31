import recipes from '../../../src/pages/api/get-recipes';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/recipe', () => ({ default: jest.fn() }));

test('get recipes api', () => {
  expect(stubRecipeBatch).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});