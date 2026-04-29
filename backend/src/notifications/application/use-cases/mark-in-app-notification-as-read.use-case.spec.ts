import { NotFoundException } from '@nestjs/common';
import { InAppNotification } from '../../domain/in-app-notification.entity';
import { InMemoryInAppNotificationRepository } from '../../infrastructure/in-memory-in-app-notification.repository';
import { MarkInAppNotificationAsReadUseCase } from './mark-in-app-notification-as-read.use-case';

describe('MarkInAppNotificationAsReadUseCase', () => {
  it('marks notification as read', async () => {
    const repository = new InMemoryInAppNotificationRepository();
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

    const useCase = new MarkInAppNotificationAsReadUseCase(repository);
    await useCase.execute(notification.id);

    const updated = await repository.findById(notification.id);
    expect(updated).not.toBeNull();
    expect(updated?.isRead).toBe(true);
    expect(updated?.readAt).not.toBeNull();
  });

  it('throws NotFoundException when notification does not exist', async () => {
    const repository = new InMemoryInAppNotificationRepository();
    const useCase = new MarkInAppNotificationAsReadUseCase(repository);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
