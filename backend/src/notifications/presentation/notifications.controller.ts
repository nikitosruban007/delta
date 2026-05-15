import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DispatchNotificationUseCase } from '../application/use-cases/dispatch-notification.use-case';
import { ListInAppNotificationsUseCase } from '../application/use-cases/list-in-app-notifications.use-case';
import { MarkInAppNotificationAsReadUseCase } from '../application/use-cases/mark-in-app-notification-as-read.use-case';
import { DispatchNotificationDto } from './dto/dispatch-notification.dto';

@Controller('notifications')
export class NotificationsController {
  private readonly dispatchNotificationUseCase: DispatchNotificationUseCase;
  private readonly listInAppNotificationsUseCase: ListInAppNotificationsUseCase;
  private readonly markInAppNotificationAsReadUseCase: MarkInAppNotificationAsReadUseCase;

  constructor(
    @Inject(DispatchNotificationUseCase)
    dispatchNotificationUseCase: any,
    @Inject(ListInAppNotificationsUseCase)
    listInAppNotificationsUseCase: any,
    @Inject(MarkInAppNotificationAsReadUseCase)
    markInAppNotificationAsReadUseCase: any,
  ) {
    this.dispatchNotificationUseCase = dispatchNotificationUseCase;
    this.listInAppNotificationsUseCase = listInAppNotificationsUseCase;
    this.markInAppNotificationAsReadUseCase =
      markInAppNotificationAsReadUseCase;
  }

  @Post('dispatch')
  async dispatch(@Body() body: DispatchNotificationDto) {
    const summary = await this.dispatchNotificationUseCase.execute(body);

    return {
      status: 'accepted',
      summary,
    };
  }

  @Get('in-app/:recipientId')
  async listInApp(@Param('recipientId') recipientId: string) {
    const notifications =
      await this.listInAppNotificationsUseCase.execute(recipientId);

    return {
      recipientId,
      notifications,
    };
  }

  @Patch('in-app/:notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: string) {
    await this.markInAppNotificationAsReadUseCase.execute(notificationId);

    return {
      status: 'updated',
      notificationId,
      isRead: true,
    };
  }
}
