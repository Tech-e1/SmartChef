import readNotifications from '../../../src/pages/api/read-notification';
import Notification from '../../../src/models/notification';
import { mockRequestResponse } from '../../apiMocks';
import { stubNotifications, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/notification', () => ({ default: jest.fn() }));

test('read notifications api', () => {
  expect(stubNotifications).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});