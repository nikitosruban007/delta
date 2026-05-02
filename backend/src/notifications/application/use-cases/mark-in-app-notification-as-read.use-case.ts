import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IN_APP_NOTIFICATION_REPOSITORY } from '../tokens';
import { InAppNotificationRepository } from '../ports/in-app-notification.repository';

@Injectable()
export class MarkInAppNotificationAsReadUseCase {
  private readonly inAppNotificationRepository: InAppNotificationRepository;

  constructor(
    @Inject(IN_APP_NOTIFICATION_REPOSITORY)
    inAppNotificationRepository: any,
  ) {
    this.inAppNotificationRepository = inAppNotificationRepository;
  }

  async execute(notificationId: string): Promise<void> {
    const notification =
      await this.inAppNotificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundException(
        `In-app notification with id '${notificationId}' was not found`,
      );
    }

    notification.markAsRead(new Date());
    await this.inAppNotificationRepository.update(notification);
  }
}
