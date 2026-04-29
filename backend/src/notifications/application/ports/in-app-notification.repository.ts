import { InAppNotification } from '../../domain/in-app-notification.entity';

export abstract class InAppNotificationRepository {
  abstract save(notification: InAppNotification): Promise<void>;
  abstract update(notification: InAppNotification): Promise<void>;
  abstract findById(id: string): Promise<InAppNotification | null>;
  abstract findByRecipient(recipientId: string): Promise<InAppNotification[]>;
}
