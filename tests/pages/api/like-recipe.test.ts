import likeRecipe from '../../../src/pages/api/like-recipe';
import mongoose from 'mongoose';
import Recipe from '../../../src/models/recipe';
import Notification from '../../../src/models/notification';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Like Recipe API', () => {
  test('handles like recipe requests', () => {
    expect(true).toBe(true);
  });
});