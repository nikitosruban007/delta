import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'node:stream';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  private readonly batchSize = 500;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async streamResultsCsv(tournamentIdParam: string): Promise<Readable> {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    await this.ensureTournamentExists(tournamentId);

    return Readable.from(this.generateCsvRows(tournamentId));
  }

  async streamTeamLeaderboardCsv(tournamentIdParam: string): Promise<Readable> {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    await this.ensureTournamentExists(tournamentId);
    return Readable.from(this.generateTeamLeaderboardRows(tournamentId));
  }

  async streamSubmissionsCsv(tournamentIdParam: string): Promise<Readable> {
    const tournamentId = this.parseId(tournamentIdParam, 'tournamentId');
    await this.ensureTournamentExists(tournamentId);
    return Readable.from(this.generateSubmissionRows(tournamentId));
  }

  private async *generateTeamLeaderboardRows(
    tournamentId: number,
  ): AsyncGenerator<string> {
    yield 'rank,teamId,teamName,totalScore,evaluationsCount\n';

    const rows = await this.prisma.leaderboard_entries.findMany({
      where: { tournament_id: tournamentId },
      orderBy: [{ rank: 'asc' }, { id: 'asc' }],
      include: { teams: { select: { id: true, name: true } } },
    });

    const teamIds = rows
      .map((r) => r.team_id)
      .filter((x): x is number => x !== null);
    const evalCounts = teamIds.length
      ? await this.prisma.evaluations.groupBy({
          by: ['submission_id'],
          where: {
            submissions: {
              team_id: { in: teamIds },
              rounds: { tournament_id: tournamentId },
            },
          },
          _count: { _all: true },
        })
      : [];

    // Map team_id -> evaluation count (sum across submissions)
    const submissionToTeam = teamIds.length
      ? await this.prisma.submissions.findMany({
          where: {
            team_id: { in: teamIds },
            rounds: { tournament_id: tournamentId },
          },
          select: { id: true, team_id: true },
        })
      : [];
    const subTeamMap = new Map<number, number>();
    for (const s of submissionToTeam) subTeamMap.set(s.id, s.team_id);
    const teamEvalMap = new Map<number, number>();
    for (const e of evalCounts) {
      const teamId = subTeamMap.get(e.submission_id);
      if (teamId !== undefined) {
        teamEvalMap.set(teamId, (teamEvalMap.get(teamId) ?? 0) + e._count._all);
      }
    }

    for (const r of rows) {
      yield [
        r.rank ?? '',
        r.team_id ?? '',
        this.escapeCsv(r.teams?.name ?? ''),
        r.total_score ?? 0,
        r.team_id ? (teamEvalMap.get(r.team_id) ?? 0) : 0,
      ].join(',') + '\n';
    }
  }

  private async *generateSubmissionRows(
    tournamentId: number,
  ): AsyncGenerator<string> {
    yield 'submissionId,teamId,teamName,roundId,roundTitle,status,githubUrl,videoUrl,liveDemoUrl,createdAt,updatedAt,evaluationsCount,averageScore\n';

    let skip = 0;
    for (;;) {
      const batch = await this.prisma.submissions.findMany({
        where: { rounds: { tournament_id: tournamentId } },
        orderBy: { id: 'asc' },
        skip,
        take: this.batchSize,
        include: {
          teams: { select: { id: true, name: true } },
          rounds: { select: { id: true, title: true } },
          evaluations: { select: { total_score: true } },
        },
      });
      if (batch.length === 0) break;
      for (const s of batch) {
        const scores = s.evaluations
          .map((e) => e.total_score)
          .filter((x): x is number => typeof x === 'number');
        const avg =
          scores.length > 0
            ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
            : '';
        yield [
          s.id,
          s.team_id,
          this.escapeCsv(s.teams?.name ?? ''),
          s.round_id,
          this.escapeCsv(s.rounds?.title ?? ''),
          s.status ?? '',
          this.escapeCsv(s.github_url ?? ''),
          this.escapeCsv(s.video_url ?? ''),
          this.escapeCsv(s.live_demo_url ?? ''),
          s.created_at?.toISOString() ?? '',
          s.updated_at?.toISOString() ?? '',
          s.evaluations.length,
          avg,
        ].join(',') + '\n';
      }
      skip += batch.length;
    }
  }

  private async *generateCsvRows(tournamentId: number): AsyncGenerator<string> {
    yield 'rank,resultId,tournamentId,userId,userName,userEmail,score,wins,timeMs,createdAt\n';

    let rank = 1;
    let skip = 0;

    for (;;) {
      const batch = await this.prisma.results.findMany({
        where: { tournament_id: tournamentId },
        orderBy: [
          { score: 'desc' },
          { wins: 'desc' },
          { time_ms: { sort: 'asc', nulls: 'last' } },
          { created_at: 'asc' },
          { id: 'asc' },
        ],
        skip,
        take: this.batchSize,
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
              name: true,
              email: true,
            },
          },
        },
      });

      if (batch.length === 0) {
        break;
      }

      for (const result of batch) {
        yield [
          rank++,
          result.id,
          result.tournament_id,
          result.user_id,
          this.escapeCsv(result.users.name),
          this.escapeCsv(result.users.email),
          result.score,
          result.wins,
          result.time_ms ?? '',
          result.created_at.toISOString(),
        ].join(',') + '\n';
      }

      skip += batch.length;
    }
  }

  private escapeCsv(value: string): string {
    if (!/[",\n\r]/.test(value)) {
      return value;
    }

    return `"${value.replace(/"/g, '""')}"`;
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

  private parseId(value: string, fieldName: string): number {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }

    return parsed;
  }
}
