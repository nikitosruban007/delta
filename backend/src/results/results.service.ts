import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { CreateResultDto } from './dto/create-result.dto';
import { ListResultsQueryDto } from './dto/list-results-query.dto';

@Injectable()
export class ResultsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  async createResult(tournamentIdParam: string, dto: CreateResultDto) {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    await this.ensureTournamentExists(tournamentId);
    await this.ensureUserExists(dto.userId);

    const result = await this.prisma.results.upsert({
      where: {
        tournament_id_user_id: {
          tournament_id: tournamentId,
          user_id: dto.userId,
        },
      },
      create: {
        tournament_id: tournamentId,
        user_id: dto.userId,
        score: dto.score,
        wins: dto.wins ?? 0,
        time_ms: dto.timeMs,
      },
      update: {
        score: dto.score,
        wins: dto.wins ?? 0,
        time_ms: dto.timeMs,
      },
      select: this.resultSelect(),
    });

    await this.leaderboardService.invalidate(tournamentId);

    return this.mapResult(result);
  }

  async listResults(tournamentIdParam: string, query: ListResultsQueryDto) {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = { tournament_id: tournamentId };

    await this.ensureTournamentExists(tournamentId);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.results.findMany({
        where,
        orderBy: [
          { score: 'desc' },
          { wins: 'desc' },
          { time_ms: { sort: 'asc', nulls: 'last' } },
          { created_at: 'asc' },
          { id: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        select: this.resultSelect(),
      }),
      this.prisma.results.count({ where }),
    ]);

    return {
      items: items.map((result) => this.mapResult(result)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private resultSelect() {
    return {
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
    };
  }

  private mapResult(result: any) {
    return {
      id: result.id,
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
    };
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

  private async ensureUserExists(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private parseId(value: string, fieldName: string): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }

    return parsed;
  }
}
