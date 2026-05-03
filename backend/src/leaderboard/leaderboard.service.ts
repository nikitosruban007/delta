import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
  }

  private async loadRankedRows(tournamentId: number): Promise<LeaderboardRow[]> {
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

  private applyRequestedSort(rows: LeaderboardRow[], query: LeaderboardQueryDto) {
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

  private getSortValue(row: LeaderboardRow, sortBy: NonNullable<LeaderboardQueryDto['sortBy']>) {
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
