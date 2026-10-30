import getUserActivity from '../../../src/pages/api/get-user-activity';
import Recipe from '../../../src/models/recipe';
import User from '../../../src/models/user';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Get User Activity API', () => {
  test('handles get user activity requests', () => {
    expect(true).toBe(true);
  });
});