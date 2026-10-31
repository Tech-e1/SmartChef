import { mockRequestResponse } from '../../apiMocks';
import Recipe from '../../../src/models/recipe';
import aigenerated from '../../../src/models/aigenerated';
import * as nextAuth from 'next-auth';
import * as op from '../../../src/lib/openai';
import { stub_recipe_1, getServerSessionStub } from '../../stub';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/recipe', () => ({ default: jest.fn() }));
jest.mock('../../../src/models/aigenerated', () => ({ default: jest.fn() }));
jest.mock('../../../src/lib/openai', () => ({}));

test('chat assistant api', () => {
  expect(stub_recipe_1).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});