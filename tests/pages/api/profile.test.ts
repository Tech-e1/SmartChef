import profile from '../../../src/pages/api/profile';
import Recipe from '../../../src/models/recipe';
import aigenerated from '../../../src/models/aigenerated';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/recipe', () => ({ default: jest.fn() }));
jest.mock('../../../src/models/aigenerated', () => ({ default: jest.fn() }));

test('profile api', () => {
  expect(stubRecipeBatch).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});