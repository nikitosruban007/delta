import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DispatchNotificationUseCase } from './application/use-cases/dispatch-notification.use-case';
import { ListInAppNotificationsUseCase } from './application/use-cases/list-in-app-notifications.use-case';
import { MarkInAppNotificationAsReadUseCase } from './application/use-cases/mark-in-app-notification-as-read.use-case';
import {
  EMAIL_GATEWAY,
  IN_APP_NOTIFICATION_REPOSITORY,
} from './application/tokens';
import { InMemoryEmailGateway } from './infrastructure/in-memory-email.gateway';
import { PrismaInAppNotificationRepository } from './infrastructure/prisma-in-app-notification.repository';
import { resolveNotificationsEmailSettings } from './infrastructure/notification-email-settings';
import { SmtpEmailGateway } from './infrastructure/smtp-email.gateway';
import { NotificationsController } from './presentation/notifications.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    DispatchNotificationUseCase,
    ListInAppNotificationsUseCase,
    MarkInAppNotificationAsReadUseCase,
    {
      provide: EMAIL_GATEWAY,
      useFactory: () => {
        const settings = resolveNotificationsEmailSettings(process.env);

        if (settings.provider === 'smtp') {
          return new SmtpEmailGateway(settings.smtp);
        }

        return new InMemoryEmailGateway();
      },
    },
    {
      provide: IN_APP_NOTIFICATION_REPOSITORY,
      useClass: PrismaInAppNotificationRepository,
    },
  ],
  exports: [
    EMAIL_GATEWAY,
    IN_APP_NOTIFICATION_REPOSITORY,
    DispatchNotificationUseCase,
  ],
})
export class NotificationsModule {}
