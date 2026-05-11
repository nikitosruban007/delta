import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';
import { LeaderboardCacheService } from '../../../leaderboard/leaderboard-cache.service';

export interface CriterionScoreInput {
  criterionId: number;
  score: number;
}

export interface ScoreSubmissionInput {
  submissionId: string;
  judgeId: string;
  score?: number;
  comment?: string | null;
  criteria?: CriterionScoreInput[];
}

@Injectable()
export class ScoreSubmissionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
    private readonly leaderboardCache: LeaderboardCacheService,
  ) {}

  async execute(input: ScoreSubmissionInput) {
    const submissionId = Number(input.submissionId);
    const judgeId = Number(input.judgeId);

    const submission = await this.prisma.submissions.findUnique({
      where: { id: submissionId },
      include: { rounds: true, teams: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    const tournamentId = submission.rounds.tournament_id;

    // Enforce that judge is assigned to this stage or whole tournament
    const assigned = await this.prisma.judge_assignments.findFirst({
      where: {
        judge_id: judgeId,
        tournament_id: tournamentId,
        OR: [{ stage_id: null }, { stage_id: submission.round_id }],
      },
    });
    if (!assigned) {
      throw new ForbiddenException('You are not assigned to score this submission');
    }

    // Compute total from criteria if provided; otherwise use explicit total score
    let totalScore: number;
    if (input.criteria && input.criteria.length > 0) {
      const criteriaIds = input.criteria.map((c) => c.criterionId);
      const dbCriteria = await this.prisma.evaluation_criteria.findMany({
        where: { id: { in: criteriaIds }, tournament_id: tournamentId },
      });
      if (dbCriteria.length !== criteriaIds.length) {
        throw new BadRequestException('Some criteria do not belong to this tournament');
      }
      // Per-round criteria must match the submission's round (if a round is bound)
      for (const def of dbCriteria) {
        if (def.round_id !== null && def.round_id !== submission.round_id) {
          throw new BadRequestException(
            `Criterion ${def.title} is bound to a different round`,
          );
        }
      }
      let sum = 0;
      let weightSum = 0;
      for (const c of input.criteria) {
        const def = dbCriteria.find((d) => d.id === c.criterionId)!;
        const maxScore = def.max_score ?? 100;
        if (c.score < 0 || c.score > maxScore) {
          throw new BadRequestException(
            `Score for criterion "${def.title}" must be between 0 and ${maxScore}`,
          );
        }
        const weight = def.weight ?? 1;
        sum += c.score * weight;
        weightSum += weight;
      }
      totalScore = weightSum > 0 ? sum / weightSum : sum;
    } else if (typeof input.score === 'number') {
      if (input.score < 0 || input.score > 100) {
        throw new BadRequestException('Score must be between 0 and 100');
      }
      totalScore = input.score;
    } else {
      throw new BadRequestException('Either score or criteria must be provided');
    }

    const evaluation = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.evaluations.findFirst({
        where: { submission_id: submissionId, jury_id: judgeId },
      });
      const e = existing
        ? await tx.evaluations.update({
            where: { id: existing.id },
            data: { total_score: totalScore, comment: input.comment ?? null },
          })
        : await tx.evaluations.create({
            data: {
              submission_id: submissionId,
              jury_id: judgeId,
              total_score: totalScore,
              comment: input.comment ?? null,
            },
          });

      if (input.criteria && input.criteria.length > 0) {
        await tx.evaluation_scores.deleteMany({ where: { evaluation_id: e.id } });
        await tx.evaluation_scores.createMany({
          data: input.criteria.map((c) => ({
            evaluation_id: e.id,
            criterion_id: c.criterionId,
            score: c.score,
          })),
        });
      }

      await tx.submissions.update({
        where: { id: submissionId },
        data: { status: 'reviewed', updated_at: new Date() },
      });

      return e;
    });

    await this.recomputeLeaderboard(tournamentId);

    await this.notifier.emitToTournament(
      String(tournamentId),
      'submission.scored',
      { submissionId: input.submissionId, evaluationId: evaluation.id, totalScore },
    );

    return {
      id: evaluation.id,
      submissionId: input.submissionId,
      judgeId: input.judgeId,
      totalScore,
      comment: input.comment ?? null,
    };
  }

  private async recomputeLeaderboard(tournamentId: number) {
    // Aggregate average evaluation score per team in this tournament
    const teams = await this.prisma.tournament_teams.findMany({
      where: { tournament_id: tournamentId },
      select: { team_id: true },
    });

    const teamIds = teams.map((t) => t.team_id!).filter(Boolean);

    const rows = await this.prisma.evaluations.findMany({
      where: {
        submissions: {
          team_id: { in: teamIds },
          rounds: { tournament_id: tournamentId },
        },
      },
      select: {
        total_score: true,
        submissions: { select: { team_id: true } },
      },
    });

    const aggregate = new Map<number, { sum: number; count: number }>();
    for (const r of rows) {
      const tid = r.submissions.team_id;
      const cur = aggregate.get(tid) ?? { sum: 0, count: 0 };
      cur.sum += r.total_score ?? 0;
      cur.count += 1;
      aggregate.set(tid, cur);
    }

    const ranked = teamIds
      .map((tid) => {
        const a = aggregate.get(tid);
        const avg = a && a.count > 0 ? a.sum / a.count : 0;
        return { teamId: tid, total: avg };
      })
      .sort((a, b) => (b.total - a.total) || (a.teamId - b.teamId));

    await this.prisma.$transaction(async (tx) => {
      await tx.leaderboard_entries.deleteMany({ where: { tournament_id: tournamentId } });
      if (ranked.length > 0) {
        await tx.leaderboard_entries.createMany({
          data: ranked.map((r, i) => ({
            tournament_id: tournamentId,
            team_id: r.teamId,
            total_score: r.total,
            rank: i + 1,
          })),
        });
      }
    });

    await this.leaderboardCache.del(`tournament:${tournamentId}:leaderboard`);
    await this.leaderboardCache.del(`tournament:${tournamentId}:leaderboard:teams`);
  }
}
