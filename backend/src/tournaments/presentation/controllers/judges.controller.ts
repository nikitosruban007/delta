import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssignJudgeUseCase } from '../../application/use-cases/assign-judge.use-case';
import { ScoreSubmissionUseCase } from '../../application/use-cases/score-submission.use-case';
import { AssignJudgeDto } from '../dto/assign-judge.dto';
import { ScoreSubmissionDto } from '../dto/score-submission.dto';
import { OrganizerGuard } from '../guards/organizer.guard';
import { JudgeGuard } from '../guards/judge.guard';

@ApiTags('judges')
@ApiBearerAuth()
@Controller('judges')
export class JudgesController {
  constructor(
    private readonly assignJudge: AssignJudgeUseCase,
    private readonly scoreSubmission: ScoreSubmissionUseCase,
  ) {}

  @UseGuards(OrganizerGuard)
  @Post('assign')
  assign(@Body() dto: AssignJudgeDto) {
    return this.assignJudge.execute(dto);
  }

  @UseGuards(JudgeGuard)
  @Post('score')
  score(@Body() dto: ScoreSubmissionDto) {
    return this.scoreSubmission.execute(dto);
  }
}
