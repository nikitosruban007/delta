import { InAppNotification } from '../../domain/in-app-notification.entity';
import { InMemoryInAppNotificationRepository } from '../../infrastructure/in-memory-in-app-notification.repository';
import { ListInAppNotificationsUseCase } from './list-in-app-notifications.use-case';

describe('ListInAppNotificationsUseCase', () => {
  it('returns notification views for the requested recipient', async () => {
    const repository = new InMemoryInAppNotificationRepository();
    const useCase = new ListInAppNotificationsUseCase(repository);
    const notification = new InAppNotification({
      id: 'notification-1',
      recipientId: 'user-1',
      subject: 'Subject',
      body: 'Body',
      isRead: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      readAt: null,
    });

    await repository.save(notification);
    await repository.save(
      new InAppNotification({
        id: 'notification-2',
        recipientId: 'user-2',
        subject: 'Other',
        body: 'Other body',
        isRead: false,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        readAt: null,
      }),
    );

    await expect(useCase.execute('user-1')).resolves.toEqual([
      notification.toObject(),
    ]);
  });

  it('returns an empty list when the recipient has no notifications', async () => {
    const repository = new InMemoryInAppNotificationRepository();
    const useCase = new ListInAppNotificationsUseCase(repository);

    await expect(useCase.execute('missing-user')).resolves.toEqual([]);
  });
});
