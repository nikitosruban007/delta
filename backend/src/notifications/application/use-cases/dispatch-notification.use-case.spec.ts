import { BadRequestException } from '@nestjs/common';
import { InMemoryEmailGateway } from '../../infrastructure/in-memory-email.gateway';
import { InMemoryInAppNotificationRepository } from '../../infrastructure/in-memory-in-app-notification.repository';
import { NotificationChannel } from '../../domain/notification-channel.enum';
import { DispatchNotificationUseCase } from './dispatch-notification.use-case';

describe('DispatchNotificationUseCase', () => {
  it('sends emails and creates in-app notifications for all recipients', async () => {
    const emailGateway = new InMemoryEmailGateway();
    const inAppRepository = new InMemoryInAppNotificationRepository();
    const useCase = new DispatchNotificationUseCase(
      emailGateway,
      inAppRepository,
    );

    const result = await useCase.execute({
      recipients: [
        {
          userId: 'user-1',
          email: 'user-1@example.com',
        },
        {
          userId: 'user-2',
          email: 'user-2@example.com',
        },
      ],
      subject: 'System update',
      body: 'We have shipped a new release.',
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    });

    expect(result.totalRecipients).toBe(2);
    expect(result.totalEmailSent).toBe(2);
    expect(result.totalInAppCreated).toBe(2);
    expect(result.inAppNotificationIds).toHaveLength(2);

    const sentEmails = emailGateway.getSentEmails();
    expect(sentEmails).toHaveLength(2);
    expect(sentEmails[0].recipientEmail).toBe('user-1@example.com');

    const userInbox = await inAppRepository.findByRecipient('user-1');
    expect(userInbox).toHaveLength(1);
    expect(userInbox[0].subject).toBe('System update');
  });

  it('creates only in-app notifications when channel EMAIL is absent', async () => {
    const emailGateway = new InMemoryEmailGateway();
    const inAppRepository = new InMemoryInAppNotificationRepository();
    const useCase = new DispatchNotificationUseCase(
      emailGateway,
      inAppRepository,
    );

    const result = await useCase.execute({
      recipients: [{ userId: 'user-42' }],
      subject: 'In-app only',
      body: 'Read this in the platform.',
      channels: [NotificationChannel.IN_APP],
    });

    expect(result.totalRecipients).toBe(1);
    expect(result.totalEmailSent).toBe(0);
    expect(result.totalInAppCreated).toBe(1);
    expect(emailGateway.getSentEmails()).toHaveLength(0);
  });

  it('throws BadRequestException when EMAIL channel is selected without recipient email', async () => {
    const emailGateway = new InMemoryEmailGateway();
    const inAppRepository = new InMemoryInAppNotificationRepository();
    const useCase = new DispatchNotificationUseCase(
      emailGateway,
      inAppRepository,
    );

    await expect(
      useCase.execute({
        recipients: [{ userId: 'user-404' }],
        subject: 'Broken email setup',
        body: 'This should fail.',
        channels: [NotificationChannel.EMAIL],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
