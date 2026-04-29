import { Module } from '@nestjs/common';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { ConsultationsGateway } from './gateway/consultations.gateway';
import { ConsultationsLogger } from './utils/logger';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, ConsultationsGateway, ConsultationsLogger],
  exports: [ConsultationsService],
})
export class ConsultationsModule {}
