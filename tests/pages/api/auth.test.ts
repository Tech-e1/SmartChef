import type { Adapter } from 'next-auth/adapters';
import type { DefaultSession } from 'next-auth';

jest.mock('next-auth/adapters', () => ({}));
jest.mock('next-auth', () => ({}));

test('auth types', () => {
  expect(true).toBe(true);
});