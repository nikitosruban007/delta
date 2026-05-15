import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateStageUseCase } from '../../application/use-cases/create-stage.use-case';
import { UpdateDeadlineUseCase } from '../../application/use-cases/update-deadline.use-case';
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateDeadlineDto } from '../dto/update-deadline.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

@ApiTags('stages')
@ApiBearerAuth()
@Controller('stages')
export class StagesController {
  constructor(
    private readonly createStage: CreateStageUseCase,
    private readonly updateDeadline: UpdateDeadlineUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create stage (tournament owner or admin only)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateStageDto) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException(
        'Only admins and organizers can create stages',
      );
    }
    return this.createStage.execute({
      tournamentId: dto.tournamentId,
      title: dto.title,
      description: dto.description ?? null,
      orderIndex: dto.orderIndex,
      deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : null,
      organizerId: user.id,
      organizerIsAdmin: user.roles.includes('ADMIN'),
    });
  }

  @Put('deadline')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update stage/tournament deadline (owner or admin only)',
  })
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateDeadlineDto) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException(
        'Only admins and organizers can update deadlines',
      );
    }
    return this.updateDeadline.execute({
      entityType: dto.entityType,
      entityId: dto.entityId,
      deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : null,
      organizerId: user.id,
      organizerIsAdmin: user.roles.includes('ADMIN'),
    });
  }
}
