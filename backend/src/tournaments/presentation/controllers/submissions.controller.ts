import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubmitWorkUseCase } from '../../application/use-cases/submit-work.use-case';
import { SubmitWorkDto } from '../dto/submit-work.dto';
import { TeamGuard } from '../guards/team.guard';

@ApiTags('submissions')
@ApiBearerAuth()
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submitWork: SubmitWorkUseCase) {}

  @UseGuards(TeamGuard)
  @Post()
  submit(@Body() dto: SubmitWorkDto) {
    return this.submitWork.execute({
      stageId: dto.stageId,
      teamId: dto.teamId,
      title: dto.title,
      contentUrl: dto.contentUrl ?? null,
    });
  }
}
