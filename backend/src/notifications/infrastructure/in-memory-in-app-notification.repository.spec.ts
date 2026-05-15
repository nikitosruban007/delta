import { InAppNotification } from '../domain/in-app-notification.entity';
import { InMemoryInAppNotificationRepository } from './in-memory-in-app-notification.repository';

describe('InMemoryInAppNotificationRepository', () => {
  const notification = (id: string, recipientId: string, createdAt: string) =>
    new InAppNotification({
      id,
      recipientId,
      subject: `Subject ${id}`,
      body: `Body ${id}`,
      isRead: false,
      createdAt: new Date(createdAt),
      readAt: null,
    });

  it('saves, updates, reads and sorts notifications by newest first', async () => {
    const repository = new InMemoryInAppNotificationRepository();
    const oldNotification = notification(
      'old',
      'user-1',
      '2026-01-01T00:00:00.000Z',
    );
    const newNotification = notification(
      'new',
      'user-1',
      '2026-01-02T00:00:00.000Z',
    );

    await repository.save(oldNotification);
    await repository.save(newNotification);
    newNotification.markAsRead(new Date('2026-01-03T00:00:00.000Z'));
    await repository.update(newNotification);

    await expect(repository.findById('missing')).resolves.toBeNull();
    await expect(repository.findById('new')).resolves.toBe(newNotification);
    await expect(repository.findByRecipient('user-1')).resolves.toEqual([
      newNotification,
      oldNotification,
    ]);
  });
});
