import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignJudgeUseCase } from '../../application/use-cases/assign-judge.use-case';
import { ScoreSubmissionUseCase } from '../../application/use-cases/score-submission.use-case';
import { AssignJudgeDto } from '../dto/assign-judge.dto';
import { ScoreSubmissionDto } from '../dto/score-submission.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { TOURNAMENT_REPOSITORY } from '../../application/ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../../application/ports/tournament.repository.port';

type AuthUser = { id: string; email: string; roles: string[]; permissions: string[] };

@ApiTags('judges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('judges')
export class JudgesController {
  constructor(
    private readonly assignJudge: AssignJudgeUseCase,
    private readonly scoreSubmission: ScoreSubmissionUseCase,
    @Inject(TOURNAMENT_REPOSITORY) private readonly repo: TournamentRepositoryPort,
  ) {}

  @Get('submissions')
  @ApiOperation({ summary: 'List submitted work assigned to the current judge' })
  async listSubmissions(@CurrentUser() user: AuthUser) {
    if (!user.roles.includes('JUDGE') && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException('Only judges and admins can view submissions for scoring');
    }
    return this.repo.listSubmissionsForJudge(user.id);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign a judge to a tournament/stage (organizer of that tournament or admin only)' })
  async assign(@CurrentUser() user: AuthUser, @Body() dto: AssignJudgeDto) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException('Only admins and organizers can assign judges');
    }
    return this.assignJudge.execute({
      tournamentId: dto.tournamentId,
      judgeId: dto.judgeId,
      stageId: dto.stageId ?? null,
      organizerId: user.id,
      organizerIsAdmin: user.roles.includes('ADMIN'),
    });
  }

  @Post('score')
  @ApiOperation({ summary: 'Score a submission (judge must be assigned to the tournament/stage)' })
  async score(@CurrentUser() user: AuthUser, @Body() dto: ScoreSubmissionDto) {
    if (!user.roles.includes('JUDGE') && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException('Only judges and admins can score submissions');
    }
    return this.scoreSubmission.execute({
      submissionId: dto.submissionId,
      judgeId: user.id,
      score: dto.score,
      criteria: dto.criteria,
      comment: dto.comment ?? null,
    });
  }
}
