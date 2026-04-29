import { InAppNotification } from '../domain/in-app-notification.entity';
import { InAppNotificationRepository } from '../application/ports/in-app-notification.repository';

export class InMemoryInAppNotificationRepository extends InAppNotificationRepository {
  private readonly storage = new Map<string, InAppNotification>();

  save(notification: InAppNotification): Promise<void> {
    this.storage.set(notification.id, notification);
    return Promise.resolve();
  }

  update(notification: InAppNotification): Promise<void> {
    this.storage.set(notification.id, notification);
    return Promise.resolve();
  }

  findById(id: string): Promise<InAppNotification | null> {
    return Promise.resolve(this.storage.get(id) ?? null);
  }

  findByRecipient(recipientId: string): Promise<InAppNotification[]> {
    return Promise.resolve(
      [...this.storage.values()]
        .filter((notification) => notification.recipientId === recipientId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    );
  }
}
