import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateStageUseCase } from '../../application/use-cases/create-stage.use-case';
import { UpdateDeadlineUseCase } from '../../application/use-cases/update-deadline.use-case';
import { CreateStageDto } from '../dto/create-stage.dto';
import { UpdateDeadlineDto } from '../dto/update-deadline.dto';
import { OrganizerGuard } from '../guards/organizer.guard';

@ApiTags('stages')
@ApiBearerAuth()
@Controller('stages')
export class StagesController {
  constructor(
    private readonly createStage: CreateStageUseCase,
    private readonly updateDeadline: UpdateDeadlineUseCase,
  ) {}

  @UseGuards(OrganizerGuard)
  @Post()
  create(@Body() dto: CreateStageDto) {
    return this.createStage.execute({
      tournamentId: dto.tournamentId,
      title: dto.title,
      description: dto.description ?? null,
      orderIndex: dto.orderIndex,
      deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : null,
    });
  }

  @UseGuards(OrganizerGuard)
  @Put('deadline')
  update(@Body() dto: UpdateDeadlineDto) {
    return this.updateDeadline.execute({
      entityType: dto.entityType,
      entityId: dto.entityId,
      deadlineAt: dto.deadlineAt ? new Date(dto.deadlineAt) : null,
    });
  }
}
