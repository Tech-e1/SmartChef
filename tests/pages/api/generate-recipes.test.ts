import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';
import * as op from '../../../src/lib/openai';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/lib/openai', () => ({}));

test('generate recipes api', () => {
  expect(stubRecipeBatch).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});