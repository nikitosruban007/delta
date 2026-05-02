import nodemailer from 'nodemailer';
import { Test } from '@nestjs/testing';
import {
  EMAIL_GATEWAY,
  IN_APP_NOTIFICATION_REPOSITORY,
} from './application/tokens';
import { InMemoryEmailGateway } from './infrastructure/in-memory-email.gateway';
import { InMemoryInAppNotificationRepository } from './infrastructure/in-memory-in-app-notification.repository';
import { SmtpEmailGateway } from './infrastructure/smtp-email.gateway';
import { NotificationsModule } from './notifications.module';
import { NotificationsController } from './presentation/notifications.controller';

jest.mock('nodemailer', () => ({
  __esModule: true,
  default: {
    createTransport: jest.fn(),
  },
}));

describe('NotificationsModule', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  it('registers controller, repository and in-memory email gateway by default', async () => {
    delete process.env.NOTIFICATIONS_EMAIL_PROVIDER;

    const moduleRef = await Test.createTestingModule({
      imports: [NotificationsModule],
    }).compile();

    expect(moduleRef.get(NotificationsController)).toBeInstanceOf(
      NotificationsController,
    );
    expect(moduleRef.get(EMAIL_GATEWAY)).toBeInstanceOf(InMemoryEmailGateway);
    expect(moduleRef.get(IN_APP_NOTIFICATION_REPOSITORY)).toBeInstanceOf(
      InMemoryInAppNotificationRepository,
    );

    await moduleRef.close();
  });

  it('registers SMTP email gateway when configured by environment', async () => {
    process.env.NOTIFICATIONS_EMAIL_PROVIDER = 'smtp';
    process.env.NOTIFICATIONS_EMAIL_FROM = 'no-reply@delta.dev';
    process.env.NOTIFICATIONS_SMTP_HOST = 'smtp.delta.dev';
    process.env.NOTIFICATIONS_SMTP_PORT = '587';
    process.env.NOTIFICATIONS_SMTP_SECURE = 'false';
    process.env.NOTIFICATIONS_SMTP_USER = 'mailer';
    process.env.NOTIFICATIONS_SMTP_PASS = 'secret';

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: jest.fn(),
    });

    const moduleRef = await Test.createTestingModule({
      imports: [NotificationsModule],
    }).compile();

    expect(moduleRef.get(EMAIL_GATEWAY)).toBeInstanceOf(SmtpEmailGateway);
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.delta.dev',
        port: 587,
      }),
    );

    await moduleRef.close();
  });
});
