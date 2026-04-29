import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications/notifications.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotificationsModule, ConsultationsModule],
})
export class AppModule {}
