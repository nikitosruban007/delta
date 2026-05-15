import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { JoinConsultationDto } from './dto/join-consultation.dto';
import { LeaveConsultationDto } from './dto/leave-consultation.dto';
import { StartConsultationDto } from './dto/start-consultation.dto';
import { EndConsultationDto } from './dto/end-consultation.dto';
import { SignalDto } from './dto/signal.dto';
import { ConsultationsService } from './consultations.service';
import { ConsultationsLogger } from './utils/logger';
import { JwtAuthGuard } from '../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../identity/presentation/decorators/current-user.decorator';

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

@ApiTags('consultations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(
    private readonly service: ConsultationsService,
    private readonly logger: ConsultationsLogger,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create consultation' })
  @ApiBody({ type: CreateConsultationDto })
  @ApiResponse({ status: 201, description: 'Consultation created' })
  async create(
    @Body() dto: CreateConsultationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.createConsultation(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List consultations for current user' })
  async listMine(@CurrentUser() user: AuthUser) {
    return this.service.getHistoryForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation by id' })
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start consultation (host only)' })
  @ApiBody({ type: StartConsultationDto })
  async start(
    @Body() dto: StartConsultationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.startConsultation(dto.consultationId, user.id);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join consultation' })
  @ApiBody({ type: JoinConsultationDto })
  async join(@Body() dto: JoinConsultationDto, @CurrentUser() user: AuthUser) {
    return this.service.joinConsultation(dto.consultationId, user.id);
  }

  @Post('leave')
  @ApiOperation({ summary: 'Leave consultation' })
  @ApiBody({ type: LeaveConsultationDto })
  async leave(
    @Body() dto: LeaveConsultationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.leaveConsultation(dto.consultationId, user.id);
  }

  @Post('end')
  @ApiOperation({ summary: 'End consultation (host only)' })
  @ApiBody({ type: EndConsultationDto })
  async end(@Body() dto: EndConsultationDto, @CurrentUser() user: AuthUser) {
    return this.service.endConsultation(dto.consultationId, user.id);
  }

  @Post('signal')
  @ApiOperation({ summary: 'Signal exchange (WebRTC pass-through)' })
  @ApiBody({ type: SignalDto })
  async signal(@Body() dto: SignalDto, @CurrentUser() user: AuthUser) {
    this.logger.info('Signal received (controller)', {
      consultationId: dto.consultationId,
      from: user.id,
    });
    return { ok: true };
  }
}
