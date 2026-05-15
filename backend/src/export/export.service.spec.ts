import { ExportService } from './export.service';

describe('ExportService', () => {
  function createService(findMany: jest.Mock) {
    const prisma = {
      tournaments: {
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
      },
      results: {
        findMany,
      },
    };

    return {
      service: new ExportService(prisma as any),
      prisma,
    };
  }

  it('streams CSV in batches from Prisma', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([
        {
          id: 11,
          tournament_id: 1,
          user_id: 2,
          score: 99,
          wins: 4,
          time_ms: 800,
          created_at: new Date('2026-05-03T10:00:00.000Z'),
          users: {
            name: 'Ada, Lovelace',
            email: 'ada@example.com',
          },
        },
      ])
      .mockResolvedValueOnce([]);
    const { service, prisma } = createService(findMany);

    const stream = await service.streamResultsCsv('1');
    const chunks: string[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk.toString());
    }

    expect(chunks.join('')).toContain(
      'rank,resultId,tournamentId,userId,userName,userEmail,score,wins,timeMs,createdAt',
    );
    expect(chunks.join('')).toContain(
      '"Ada, Lovelace",ada@example.com,99,4,800',
    );
    expect(prisma.results.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ skip: 0, take: 500 }),
    );
  });

  it('escapes quotes and leaves empty time values blank', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValueOnce([
        {
          id: 12,
          tournament_id: 1,
          user_id: 3,
          score: 88,
          wins: 2,
          time_ms: null,
          created_at: new Date('2026-05-03T11:00:00.000Z'),
          users: {
            name: 'Grace "Amazing" Hopper',
            email: 'grace@example.com',
          },
        },
      ])
      .mockResolvedValueOnce([]);
    const { service } = createService(findMany);

    const stream = await service.streamResultsCsv('1');
    const chunks: string[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk.toString());
    }

    expect(chunks.join('')).toContain(
      '"Grace ""Amazing"" Hopper",grace@example.com,88,2,,',
    );
  });

  it('rejects invalid ids and missing tournaments before streaming rows', async () => {
    const { service, prisma } = createService(jest.fn());

    await expect(service.streamResultsCsv('bad')).rejects.toThrow(
      'Invalid tournamentId',
    );

    prisma.tournaments.findUnique.mockResolvedValueOnce(null);

    await expect(service.streamResultsCsv('1')).rejects.toThrow(
      'Tournament not found',
    );
    expect(prisma.results.findMany).not.toHaveBeenCalled();
  });
});
