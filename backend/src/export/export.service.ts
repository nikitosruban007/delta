import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
