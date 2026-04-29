import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { JoinConsultationDto } from './dto/join-consultation.dto';
import { StartConsultationDto } from './dto/start-consultation.dto';
import { EndConsultationDto } from './dto/end-consultation.dto';
import { SignalDto } from './dto/signal.dto';
import { ConsultationsService } from './consultations.service';
import { ConsultationsLogger } from './utils/logger';

@ApiTags('consultations')
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly service: ConsultationsService, private readonly logger: ConsultationsLogger) {}

  @Post()
  @ApiOperation({ summary: 'Create consultation' })
  @ApiBody({ type: CreateConsultationDto })
  @ApiResponse({ status: 201, description: 'Consultation created' })
  async create(@Body() dto: CreateConsultationDto) {
    const consultation = await this.service.createConsultation(dto);
    return consultation;
  }

  @Post('start')
  @ApiOperation({ summary: 'Start consultation (host only)' })
  @ApiBody({ type: StartConsultationDto })
  async start(@Body() dto: StartConsultationDto) {
    const result = await this.service.startConsultation(dto.consultationId, dto.userId);
    return result;
  }

  @Post('join')
  @ApiOperation({ summary: 'Join consultation' })
  @ApiBody({ type: JoinConsultationDto })
  async join(@Body() dto: JoinConsultationDto) {
    const participant = await this.service.joinConsultation(dto.consultationId, dto.userId);
    return participant;
  }

  @Post('end')
  @ApiOperation({ summary: 'End consultation (host only)' })
  @ApiBody({ type: EndConsultationDto })
  async end(@Body() dto: EndConsultationDto) {
    const result = await this.service.endConsultation(dto.consultationId, dto.userId);
    return result;
  }

  @Post('signal')
  @ApiOperation({ summary: 'Signal exchange (pass-through)' })
  @ApiBody({ type: SignalDto })
  async signal(@Body() dto: SignalDto) {
    this.logger.info('Signal received (controller)', { consultationId: dto.consultationId, from: dto.fromUserId });
    await this.service.emitSignalPlaceholder();
    return { ok: true };
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get consultations history for a user' })
  async history(@Param('userId') userId: string) {
    const history = await this.service.getHistoryForUser(userId);
    return history;
  }
}
