import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardCacheService } from './leaderboard-cache.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';

type LeaderboardRow = {
  id: number;
  rank: number;
  tournamentId: number;
  userId: number;
  score: number;
  wins: number;
  timeMs: number | null;
  createdAt: Date | string;
  user: {
    id: number;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};

@Injectable()
export class LeaderboardService {
  private readonly cacheTtlSeconds = 300;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly cache: LeaderboardCacheService,
  ) {}

  async getLeaderboard(tournamentIdParam: string, query: LeaderboardQueryDto) {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const cacheKey = this.getCacheKey(tournamentId);

    await this.ensureTournamentExists(tournamentId);

    let rows = await this.cache.get<LeaderboardRow[]>(cacheKey);
    const cacheHit = Boolean(rows);

    if (!rows) {
      rows = await this.loadRankedRows(tournamentId);
      await this.cache.set(cacheKey, rows, this.cacheTtlSeconds);
    }

    const sortedRows = this.applyRequestedSort(rows, query);
    const total = sortedRows.length;
    const start = (page - 1) * limit;

    return {
      items: sortedRows.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      sort: {
        sortBy: query.sortBy ?? 'score',
        order: query.order ?? 'desc',
      },
      cache: {
        key: cacheKey,
        hit: cacheHit,
      },
    };
  }

  async invalidate(tournamentId: number): Promise<void> {
    await this.cache.del(this.getCacheKey(tournamentId));
    await this.cache.del(`tournament:${tournamentId}:leaderboard:teams`);
  }

  async getTeamLeaderboardForRound(
    tournamentIdParam: string,
    roundIdParam: string,
  ) {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    const roundId = this.parseId(roundIdParam, 'roundId');
    await this.ensureTournamentExists(tournamentId);

    const round = await this.prisma.rounds.findUnique({
      where: { id: roundId },
      select: { id: true, tournament_id: true, title: true },
    });
    if (!round || round.tournament_id !== tournamentId) {
      throw new NotFoundException('Round does not belong to this tournament');
    }

    const rows = await this.prisma.evaluations.findMany({
      where: { submissions: { round_id: roundId } },
      include: {
        submissions: {
          select: {
            team_id: true,
            teams: { select: { id: true, name: true } },
          },
        },
      },
    });

    const agg = new Map<
      number,
      { teamName: string; sum: number; count: number }
    >();
    for (const r of rows) {
      const teamId = r.submissions.team_id;
      const cur = agg.get(teamId) ?? {
        teamName: r.submissions.teams?.name ?? '',
        sum: 0,
        count: 0,
      };
      cur.sum += r.total_score ?? 0;
      cur.count += 1;
      agg.set(teamId, cur);
    }

    const items = [...agg.entries()]
      .map(([teamId, v]) => ({
        teamId: String(teamId),
        teamName: v.teamName,
        totalScore: v.count > 0 ? v.sum / v.count : 0,
        evaluationsCount: v.count,
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, idx) => ({ rank: idx + 1, ...entry }));

    return {
      round: { id: String(round.id), title: round.title },
      items,
      cache: { key: '', hit: false },
    };
  }

  async getTeamLeaderboard(tournamentIdParam: string) {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    const cacheKey = `tournament:${tournamentId}:leaderboard:teams:v2`;
    await this.ensureTournamentExists(tournamentId);

    const cached = await this.cache.get<{
      items: any[];
      criteria: any[];
    }>(cacheKey);
    if (cached) return { ...cached, cache: { key: cacheKey, hit: true } };

    const rows = await this.prisma.leaderboard_entries.findMany({
      where: { tournament_id: tournamentId },
      orderBy: [{ rank: 'asc' }, { id: 'asc' }],
      include: { teams: { select: { id: true, name: true } } },
    });

    // Top-level criteria (parent or standalone) for column breakdown
    const allCriteria = await this.prisma.evaluation_criteria.findMany({
      where: { tournament_id: tournamentId },
      orderBy: { id: 'asc' },
    });
    const topLevelCriteria = allCriteria.filter((c) => c.parent_id === null);
    const childrenByParent = new Map<number, typeof allCriteria>();
    for (const c of allCriteria) {
      if (c.parent_id !== null) {
        const arr = childrenByParent.get(c.parent_id) ?? [];
        arr.push(c);
        childrenByParent.set(c.parent_id, arr);
      }
    }

    // For each top-level criterion, pull all evaluation_scores for this tournament
    // grouped by team. We must aggregate via evaluations → submissions → team.
    const teamIds = rows
      .map((r) => r.team_id)
      .filter((x): x is number => x !== null);

    const allScores = teamIds.length
      ? await this.prisma.evaluation_scores.findMany({
          where: {
            evaluations: {
              submissions: {
                team_id: { in: teamIds },
                rounds: { tournament_id: tournamentId },
              },
            },
          },
          select: {
            criterion_id: true,
            score: true,
            evaluations: {
              select: {
                submissions: { select: { team_id: true } },
              },
            },
          },
        })
      : [];

    // Build map: teamId -> criterionId -> { sum, count }
    const teamCriterionStats = new Map<
      number,
      Map<number, { sum: number; count: number }>
    >();
    for (const s of allScores) {
      const teamId = s.evaluations?.submissions?.team_id;
      const criterionId = s.criterion_id;
      if (!teamId || criterionId === null || s.score === null) continue;
      let perTeam = teamCriterionStats.get(teamId);
      if (!perTeam) {
        perTeam = new Map();
        teamCriterionStats.set(teamId, perTeam);
      }
      const cur = perTeam.get(criterionId) ?? { sum: 0, count: 0 };
      cur.sum += s.score;
      cur.count += 1;
      perTeam.set(criterionId, cur);
    }

    const breakdownForTeam = (teamId: number) => {
      const perTeam = teamCriterionStats.get(teamId);
      return topLevelCriteria.map((tc) => {
        const childIds = (childrenByParent.get(tc.id) ?? []).map((c) => c.id);
        const ids = childIds.length > 0 ? childIds : [tc.id];
        let sum = 0;
        let count = 0;
        if (perTeam) {
          for (const id of ids) {
            const stat = perTeam.get(id);
            if (stat) {
              sum += stat.sum;
              count += stat.count;
            }
          }
        }
        return {
          criterionId: String(tc.id),
          title: tc.title ?? '',
          maxScore: tc.max_score ?? 100,
          averageScore: count > 0 ? sum / count : null,
        };
      });
    };

    const items = rows.map((r) => ({
      rank: r.rank ?? 0,
      teamId: r.team_id ? String(r.team_id) : null,
      teamName: r.teams?.name ?? '',
      totalScore: r.total_score ?? 0,
      breakdown: r.team_id ? breakdownForTeam(r.team_id) : [],
    }));

    const criteria = topLevelCriteria.map((c) => ({
      id: String(c.id),
      title: c.title ?? '',
      maxScore: c.max_score ?? 100,
    }));

    const payload = { items, criteria };
    await this.cache.set(cacheKey, payload, this.cacheTtlSeconds);
    return { ...payload, cache: { key: cacheKey, hit: false } };
  }

  private async loadRankedRows(
    tournamentId: number,
  ): Promise<LeaderboardRow[]> {
    const results = await this.prisma.results.findMany({
      where: { tournament_id: tournamentId },
      orderBy: [
        { score: 'desc' },
        { wins: 'desc' },
        { time_ms: { sort: 'asc', nulls: 'last' } },
        { created_at: 'asc' },
        { id: 'asc' },
      ],
      select: {
        id: true,
        tournament_id: true,
        user_id: true,
        score: true,
        wins: true,
        time_ms: true,
        created_at: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
    });

    return results.map((result, index) => ({
      id: result.id,
      rank: index + 1,
      tournamentId: result.tournament_id,
      userId: result.user_id,
      score: result.score,
      wins: result.wins,
      timeMs: result.time_ms,
      createdAt: result.created_at,
      user: {
        id: result.users.id,
        name: result.users.name,
        email: result.users.email,
        avatarUrl: result.users.avatar_url,
      },
    }));
  }

  private applyRequestedSort(
    rows: LeaderboardRow[],
    query: LeaderboardQueryDto,
  ) {
    const sortBy = query.sortBy ?? 'score';
    const order = query.order ?? 'desc';

    if (sortBy === 'score' && order === 'desc') {
      return rows;
    }

    const direction = order === 'asc' ? 1 : -1;

    return [...rows].sort((left, right) => {
      const leftValue = this.getSortValue(left, sortBy);
      const rightValue = this.getSortValue(right, sortBy);

      if (leftValue === rightValue) {
        return left.rank - right.rank;
      }

      if (leftValue === null) return 1;
      if (rightValue === null) return -1;

      return leftValue > rightValue ? direction : -direction;
    });
  }

  private getSortValue(
    row: LeaderboardRow,
    sortBy: NonNullable<LeaderboardQueryDto['sortBy']>,
  ) {
    if (sortBy === 'time') return row.timeMs;
    if (sortBy === 'createdAt') return new Date(row.createdAt).getTime();
    return row[sortBy];
  }

  private async ensureTournamentExists(id: number) {
    const tournament = await this.prisma.tournaments.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
  }

  private getCacheKey(tournamentId: number) {
    return `tournament:${tournamentId}:leaderboard`;
  }

  private parseId(value: string, fieldName: string): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }

    return parsed;
  }
}
