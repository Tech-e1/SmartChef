import getUserActivity from '../../../src/pages/api/get-user-activity';
import Recipe from '../../../src/models/recipe';
import User from '../../../src/models/user';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/recipe', () => ({ default: jest.fn() }));
jest.mock('../../../src/models/user', () => ({ default: jest.fn() }));

test('get user activity api', () => {
  expect(stubRecipeBatch).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});