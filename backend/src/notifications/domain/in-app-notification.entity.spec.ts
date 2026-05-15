import { InAppNotification } from './in-app-notification.entity';

describe('InAppNotification', () => {
  const createNotification = (isRead = false) =>
    new InAppNotification({
      id: 'notification-1',
      recipientId: 'user-1',
      subject: 'Subject',
      body: 'Body',
      isRead,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      readAt: isRead ? new Date('2026-01-02T00:00:00.000Z') : null,
    });

  it('exposes notification properties and object snapshots', () => {
    const notification = createNotification();

    expect(notification.id).toBe('notification-1');
    expect(notification.recipientId).toBe('user-1');
    expect(notification.subject).toBe('Subject');
    expect(notification.body).toBe('Body');
    expect(notification.isRead).toBe(false);
    expect(notification.createdAt).toEqual(
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(notification.readAt).toBeNull();
    expect(notification.toObject()).toEqual({
      id: 'notification-1',
      recipientId: 'user-1',
      subject: 'Subject',
      body: 'Body',
      isRead: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      readAt: null,
    });
  });

  it('marks unread notifications as read once', () => {
    const notification = createNotification();
    const readAt = new Date('2026-01-03T00:00:00.000Z');

    notification.markAsRead(readAt);

    expect(notification.isRead).toBe(true);
    expect(notification.readAt).toBe(readAt);
  });

  it('keeps readAt unchanged when an already read notification is marked again', () => {
    const notification = createNotification(true);
    const originalReadAt = notification.readAt;

    notification.markAsRead(new Date('2026-01-04T00:00:00.000Z'));

    expect(notification.readAt).toBe(originalReadAt);
  });
});
