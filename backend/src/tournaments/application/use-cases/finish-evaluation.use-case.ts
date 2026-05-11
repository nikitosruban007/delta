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

export interface FinishEvaluationInput {
  tournamentId: string;
  organizerId: string;
  organizerIsAdmin: boolean;
}

@Injectable()
export class FinishEvaluationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
    private readonly leaderboardCache: LeaderboardCacheService,
  ) {}

  async execute(input: FinishEvaluationInput) {
    const tournamentId = Number(input.tournamentId);

    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    if (!input.organizerIsAdmin && tournament.created_by !== Number(input.organizerId)) {
      throw new ForbiddenException('You do not own this tournament');
    }

    if (tournament.status === 'finished') {
      throw new BadRequestException('Tournament is already finished');
    }

    // Re-aggregate from evaluations (final tally)
    const teams = await this.prisma.tournament_teams.findMany({
      where: { tournament_id: tournamentId },
      select: { team_id: true },
    });
    const teamIds = teams.map((t) => t.team_id!).filter(Boolean);

    const rows = await this.prisma.evaluations.findMany({
      where: {
        submissions: { team_id: { in: teamIds }, rounds: { tournament_id: tournamentId } },
      },
      select: { total_score: true, submissions: { select: { team_id: true } } },
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
      await tx.tournaments.update({
        where: { id: tournamentId },
        data: { status: 'finished', ends_at: tournament.ends_at ?? new Date() },
      });
    });

    await this.leaderboardCache.del(`tournament:${tournamentId}:leaderboard`);
    await this.leaderboardCache.del(`tournament:${tournamentId}:leaderboard:teams`);

    await this.notifier.emitToTournament(input.tournamentId, 'tournament.finished', {
      tournamentId: input.tournamentId,
      rankings: ranked.slice(0, 10).map((r, i) => ({
        rank: i + 1,
        teamId: String(r.teamId),
        score: r.total,
      })),
    });

    return {
      tournamentId: input.tournamentId,
      status: 'finished',
      rankings: ranked.map((r, i) => ({
        rank: i + 1,
        teamId: String(r.teamId),
        totalScore: r.total,
      })),
    };
  }
}
