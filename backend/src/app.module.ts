import { Module } from '@nestjs/common';
import { NotificationsModule } from './notifications/notifications.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './identity/identity.module';
import { ForumsModule } from './forums';

@Module({
  imports: [
    PrismaModule,
    IdentityModule,
    NotificationsModule,
    ConsultationsModule,
    ForumsModule,
  ],
})
export class AppModule {}
