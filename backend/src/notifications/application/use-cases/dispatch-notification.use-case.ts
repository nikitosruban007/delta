import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InAppNotification } from '../../domain/in-app-notification.entity';
import { NotificationChannel } from '../../domain/notification-channel.enum';
import { EmailGateway } from '../ports/email.gateway';
import { InAppNotificationRepository } from '../ports/in-app-notification.repository';
import { EMAIL_GATEWAY, IN_APP_NOTIFICATION_REPOSITORY } from '../tokens';

export type DispatchNotificationCommand = {
  recipients: DispatchNotificationRecipient[];
  subject: string;
  body: string;
  channels: NotificationChannel[];
};

export type DispatchNotificationRecipient = {
  userId: string;
  email?: string;
};

export type DispatchNotificationResult = {
  totalRecipients: number;
  totalEmailSent: number;
  totalInAppCreated: number;
  inAppNotificationIds: string[];
};

@Injectable()
export class DispatchNotificationUseCase {
  private readonly emailGateway: EmailGateway;
  private readonly inAppNotificationRepository: InAppNotificationRepository;

  constructor(
    @Inject(EMAIL_GATEWAY)
    emailGateway: any,
    @Inject(IN_APP_NOTIFICATION_REPOSITORY)
    inAppNotificationRepository: any,
  ) {
    this.emailGateway = emailGateway;
    this.inAppNotificationRepository = inAppNotificationRepository;
  }

  async execute(
    command: DispatchNotificationCommand,
  ): Promise<DispatchNotificationResult> {
    const isEmailChannelEnabled = command.channels.includes(
      NotificationChannel.EMAIL,
    );
    const isInAppChannelEnabled = command.channels.includes(
      NotificationChannel.IN_APP,
    );

    if (isEmailChannelEnabled) {
      const recipientsWithoutEmail = command.recipients
        .filter((recipient) => !recipient.email?.trim())
        .map((recipient) => recipient.userId);

      if (recipientsWithoutEmail.length > 0) {
        throw new BadRequestException(
          `Email channel requires recipient email for users: ${recipientsWithoutEmail.join(', ')}`,
        );
      }
    }

    let totalEmailSent = 0;
    const inAppNotificationIds: string[] = [];

    for (const recipient of command.recipients) {
      if (isEmailChannelEnabled) {
        const recipientEmail = this.requireRecipientEmail(recipient);

        await this.emailGateway.send({
          recipientId: recipient.userId,
          recipientEmail,
          subject: command.subject,
          body: command.body,
        });
        totalEmailSent += 1;
      }

      if (isInAppChannelEnabled) {
        const notification = new InAppNotification({
          id: randomUUID(),
          recipientId: recipient.userId,
          subject: command.subject,
          body: command.body,
          isRead: false,
          createdAt: new Date(),
          readAt: null,
        });

        await this.inAppNotificationRepository.save(notification);
        inAppNotificationIds.push(notification.id);
      }
    }

    return {
      totalRecipients: command.recipients.length,
      totalEmailSent,
      totalInAppCreated: inAppNotificationIds.length,
      inAppNotificationIds,
    };
  }

  private requireRecipientEmail(
    recipient: DispatchNotificationRecipient,
  ): string {
    const email = recipient.email?.trim();
    if (!email) {
      throw new BadRequestException(
        `Email channel requires recipient email for user: ${recipient.userId}`,
      );
    }

    return email;
  }
}
