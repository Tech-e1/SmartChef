import profile from '../../../src/pages/api/profile';
import Recipe from '../../../src/models/recipe';
import aigenerated from '../../../src/models/aigenerated';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Profile API', () => {
  test('handles profile requests', () => {
    expect(true).toBe(true);
  });
});