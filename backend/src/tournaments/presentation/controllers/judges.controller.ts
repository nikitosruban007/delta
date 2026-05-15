import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssignJudgeUseCase } from '../../application/use-cases/assign-judge.use-case';
import { ScoreSubmissionUseCase } from '../../application/use-cases/score-submission.use-case';
import { AssignJudgeDto } from '../dto/assign-judge.dto';
import { ScoreSubmissionDto } from '../dto/score-submission.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../identity/presentation/decorators/current-user.decorator';
import { TOURNAMENT_REPOSITORY } from '../../application/ports/tournament.repository.port';
import type { TournamentRepositoryPort } from '../../application/ports/tournament.repository.port';

type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

@ApiTags('judges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('judges')
export class JudgesController {
  constructor(
    private readonly assignJudge: AssignJudgeUseCase,
    private readonly scoreSubmission: ScoreSubmissionUseCase,
    @Inject(TOURNAMENT_REPOSITORY)
    private readonly repo: TournamentRepositoryPort,
    private readonly prisma: PrismaService,
  ) {}

  /** A user can act as a judge if they have at least one judge_assignments row,
   *  or if they are an ADMIN. There is no standalone JUDGE role.
   */
  private async assertCanJudge(user: AuthUser): Promise<void> {
    if (user.roles.includes('ADMIN')) return;
    const assignment = await this.prisma.judge_assignments.findFirst({
      where: { judge_id: Number(user.id) },
      select: { id: true },
    });
    if (!assignment) {
      throw new ForbiddenException(
        'You are not assigned as a judge for any tournament',
      );
    }
  }

  @Get('submissions')
  @ApiOperation({
    summary: 'List submitted work assigned to the current judge',
  })
  async listSubmissions(@CurrentUser() user: AuthUser) {
    await this.assertCanJudge(user);
    return this.repo.listSubmissionsForJudge(user.id);
  }

  @Get('submissions/:id')
  @ApiOperation({
    summary:
      'Get one submission for scoring (includes my per-criterion scores when present)',
  })
  async getSubmission(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.assertCanJudge(user);
    const submissionId = Number(id);
    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      throw new NotFoundException('Submission not found');
    }

    const row = await this.prisma.submissions.findUnique({
      where: { id: submissionId },
      include: {
        teams: { select: { id: true, name: true } },
        rounds: {
          select: {
            id: true,
            title: true,
            tournament_id: true,
            tournaments: { select: { id: true, title: true, status: true } },
          },
        },
        evaluations: {
          where: { jury_id: Number(user.id) },
          include: { evaluation_scores: true },
        },
      },
    });
    if (!row) throw new NotFoundException('Submission not found');

    if (!user.roles.includes('ADMIN')) {
      // Must be assigned to this stage or the whole tournament
      const assigned = await this.prisma.judge_assignments.findFirst({
        where: {
          judge_id: Number(user.id),
          tournament_id: row.rounds?.tournament_id ?? -1,
          OR: [{ stage_id: null }, { stage_id: row.round_id }],
        },
      });
      if (!assigned) {
        throw new ForbiddenException(
          'You are not assigned to score this submission',
        );
      }
    }

    const ev = row.evaluations[0] ?? null;
    return {
      id: String(row.id),
      teamId: String(row.team_id),
      teamName: row.teams?.name ?? '',
      stageId: String(row.round_id),
      stageName: row.rounds?.title ?? '',
      tournamentId: String(row.rounds?.tournament_id),
      tournamentTitle: row.rounds?.tournaments?.title ?? '',
      tournamentStatus: row.rounds?.tournaments?.status ?? null,
      githubUrl: row.github_url,
      videoUrl: row.video_url,
      liveDemoUrl: row.live_demo_url,
      description: row.description,
      status: row.status ?? 'submitted',
      createdAt: row.created_at,
      evaluation: ev
        ? {
            id: ev.id,
            totalScore: ev.total_score ?? 0,
            comment: ev.comment,
            scores: ev.evaluation_scores.map((s) => ({
              criterionId: s.criterion_id ? String(s.criterion_id) : null,
              score: s.score ?? 0,
            })),
          }
        : null,
    };
  }

  @Post('assign')
  @ApiOperation({
    summary:
      'Assign a judge to a tournament/stage (organizer of that tournament or admin only)',
  })
  async assign(@CurrentUser() user: AuthUser, @Body() dto: AssignJudgeDto) {
    if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
      throw new ForbiddenException(
        'Only admins and organizers can assign judges',
      );
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
  @ApiOperation({
    summary:
      'Score a submission (judge must be assigned to the tournament/stage)',
  })
  async score(@CurrentUser() user: AuthUser, @Body() dto: ScoreSubmissionDto) {
    // No coarse JUDGE-role gate. The score-submission use-case verifies that
    // the user has a judge_assignments row for the specific tournament/stage.
    return this.scoreSubmission.execute({
      submissionId: dto.submissionId,
      judgeId: user.id,
      score: dto.score,
      criteria: dto.criteria,
      comment: dto.comment ?? null,
    });
  }
}
