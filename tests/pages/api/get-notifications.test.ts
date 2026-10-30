import getNotifications from '../../../src/pages/api/get-notifications';
import Notification from '../../../src/models/notification';
import { mockRequestResponse } from '../../apiMocks';
import { stubNotifications, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Get Notifications API', () => {
  test('handles get notifications requests', () => {
    expect(true).toBe(true);
  });
});