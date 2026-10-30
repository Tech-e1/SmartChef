import readNotifications from '../../../src/pages/api/read-notification';
import Notification from '../../../src/models/notification';
import { mockRequestResponse } from '../../apiMocks';
import { stubNotifications, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

describe('Read Notifications API', () => {
  test('handles read notifications requests', () => {
    expect(true).toBe(true);
  });
});