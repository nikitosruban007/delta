import { Inject, Injectable } from '@nestjs/common';
import { InAppNotificationRepository } from '../ports/in-app-notification.repository';
import { IN_APP_NOTIFICATION_REPOSITORY } from '../tokens';

export type InAppNotificationView = {
  id: string;
  recipientId: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
};

@Injectable()
export class ListInAppNotificationsUseCase {
  private readonly inAppNotificationRepository: InAppNotificationRepository;

  constructor(
    @Inject(IN_APP_NOTIFICATION_REPOSITORY)
    inAppNotificationRepository: any,
  ) {
    this.inAppNotificationRepository = inAppNotificationRepository;
  }

  async execute(recipientId: string): Promise<InAppNotificationView[]> {
    const notifications =
      await this.inAppNotificationRepository.findByRecipient(recipientId);

    return notifications.map((notification) => notification.toObject());
  }
}
