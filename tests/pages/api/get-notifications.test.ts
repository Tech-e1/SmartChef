import getNotifications from '../../../src/pages/api/get-notifications';
import Notification from '../../../src/models/notification';
import { mockRequestResponse } from '../../apiMocks';
import { stubNotifications, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

jest.mock('next-auth', () => ({}));
jest.mock('../../../src/models/notification', () => ({ default: jest.fn() }));

test('get notifications api', () => {
  expect(stubNotifications).toBeDefined();
  expect(getServerSessionStub).toBeDefined();
});