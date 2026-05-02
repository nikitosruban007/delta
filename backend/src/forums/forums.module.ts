import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ForumsController } from './forums.controller';
import { ForumsService } from './forums.service';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [ForumsController],
  providers: [ForumsService],
  exports: [ForumsService],
})
export class ForumsModule {}
