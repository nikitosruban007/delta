import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  const createController = () => {
    const dispatchNotificationUseCase = {
      execute: jest.fn(),
    };
    const listInAppNotificationsUseCase = {
      execute: jest.fn(),
    };
    const markInAppNotificationAsReadUseCase = {
      execute: jest.fn(),
    };

    return {
      dispatchNotificationUseCase,
      listInAppNotificationsUseCase,
      markInAppNotificationAsReadUseCase,
      controller: new NotificationsController(
        dispatchNotificationUseCase,
        listInAppNotificationsUseCase,
        markInAppNotificationAsReadUseCase,
      ),
    };
  };

  it('dispatches notifications and wraps the summary response', async () => {
    const { controller, dispatchNotificationUseCase } = createController();
    const summary = {
      totalRecipients: 1,
      totalEmailSent: 1,
      totalInAppCreated: 0,
      inAppNotificationIds: [],
    };
    const command = {
      recipients: [{ userId: 'user-1', email: 'user@example.com' }],
      subject: 'Subject',
      body: 'Body',
      channels: ['EMAIL' as never],
    };

    dispatchNotificationUseCase.execute.mockResolvedValue(summary);

    await expect(controller.dispatch(command)).resolves.toEqual({
      status: 'accepted',
      summary,
    });
    expect(dispatchNotificationUseCase.execute).toHaveBeenCalledWith(command);
  });

  it('lists in-app notifications for a recipient', async () => {
    const { controller, listInAppNotificationsUseCase } = createController();
    const notifications = [
      {
        id: 'notification-1',
        recipientId: 'user-1',
        subject: 'Subject',
        body: 'Body',
        isRead: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        readAt: null,
      },
    ];

    listInAppNotificationsUseCase.execute.mockResolvedValue(notifications);

    await expect(controller.listInApp('user-1')).resolves.toEqual({
      recipientId: 'user-1',
      notifications,
    });
    expect(listInAppNotificationsUseCase.execute).toHaveBeenCalledWith(
      'user-1',
    );
  });

  it('marks an in-app notification as read', async () => {
    const { controller, markInAppNotificationAsReadUseCase } =
      createController();

    markInAppNotificationAsReadUseCase.execute.mockResolvedValue(undefined);

    await expect(controller.markAsRead('notification-1')).resolves.toEqual({
      status: 'updated',
      notificationId: 'notification-1',
      isRead: true,
    });
    expect(markInAppNotificationAsReadUseCase.execute).toHaveBeenCalledWith(
      'notification-1',
    );
  });
});
