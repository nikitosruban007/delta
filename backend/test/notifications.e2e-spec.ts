/* istanbul ignore file */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { NotificationsModule } from '../src/notifications/notifications.module';

type DispatchResponseBody = {
  status: string;
  summary: {
    totalRecipients: number;
    totalEmailSent: number;
    totalInAppCreated: number;
    inAppNotificationIds: string[];
  };
};

type InboxResponseBody = {
  recipientId: string;
  notifications: Array<{
    id: string;
    isRead: boolean;
  }>;
};

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let httpServer: Parameters<typeof request>[0];
  const initialProvider = process.env.NOTIFICATIONS_EMAIL_PROVIDER;

  beforeAll(async () => {
    process.env.NOTIFICATIONS_EMAIL_PROVIDER = 'in-memory';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationsModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    httpServer = app.getHttpServer() as Parameters<typeof request>[0];
  });

  afterAll(async () => {
    await app.close();
    process.env.NOTIFICATIONS_EMAIL_PROVIDER = initialProvider;
  });

  it('dispatches notifications to email and in-app channels', async () => {
    const response = await request(httpServer)
      .post('/notifications/dispatch')
      .send({
        recipients: [
          { userId: 'u-1', email: 'u-1@example.com' },
          { userId: 'u-2', email: 'u-2@example.com' },
        ],
        subject: 'Hello',
        body: 'Important update',
        channels: ['EMAIL', 'IN_APP'],
      })
      .expect(201);
    const body = response.body as DispatchResponseBody;

    expect(body.status).toBe('accepted');
    expect(body.summary.totalRecipients).toBe(2);
    expect(body.summary.totalEmailSent).toBe(2);
    expect(body.summary.totalInAppCreated).toBe(2);
    expect(body.summary.inAppNotificationIds).toHaveLength(2);
  });

  it('returns validation error for invalid dispatch payload', async () => {
    await request(httpServer)
      .post('/notifications/dispatch')
      .send({
        recipients: [],
        subject: '',
        body: '',
        channels: ['SMS'],
      })
      .expect(400);
  });

  it('returns business error when EMAIL channel has recipients without email', async () => {
    await request(httpServer)
      .post('/notifications/dispatch')
      .send({
        recipients: [{ userId: 'u-3' }],
        subject: 'Email required',
        body: 'No email in recipient',
        channels: ['EMAIL'],
      })
      .expect(400);
  });

  it('reads recipient inbox and marks notification as read', async () => {
    const dispatchResponse = await request(httpServer)
      .post('/notifications/dispatch')
      .send({
        recipients: [{ userId: 'u-42' }],
        subject: 'Platform notice',
        body: 'Message body',
        channels: ['IN_APP'],
      })
      .expect(201);
    const dispatchBody = dispatchResponse.body as DispatchResponseBody;

    const notificationId = dispatchBody.summary.inAppNotificationIds[0];

    const inboxResponse = await request(httpServer)
      .get('/notifications/in-app/u-42')
      .expect(200);
    const inboxBody = inboxResponse.body as InboxResponseBody;

    expect(inboxBody.notifications).toHaveLength(1);
    expect(inboxBody.notifications[0].id).toBe(notificationId);
    expect(inboxBody.notifications[0].isRead).toBe(false);

    await request(httpServer)
      .patch(`/notifications/in-app/${notificationId}/read`)
      .expect(200);

    const updatedInboxResponse = await request(httpServer)
      .get('/notifications/in-app/u-42')
      .expect(200);
    const updatedInboxBody = updatedInboxResponse.body as InboxResponseBody;

    expect(updatedInboxBody.notifications[0].isRead).toBe(true);
  });
});
