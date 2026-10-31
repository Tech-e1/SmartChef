import likeRecipe from '../../../src/pages/api/like-recipe';
import mongoose from 'mongoose';
import Recipe from '../../../src/models/recipe';
import Notification from '../../../src/models/notification';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('mongoose', () => ({}));
jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/recipe', () => ({ default: jest.fn() }));
jest.mock('../../../src/models/notification', () => ({ default: jest.fn() }));

test('like recipe api', () => {
  expect(stubRecipeBatch).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});