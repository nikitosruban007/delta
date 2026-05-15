import { LeaderboardCacheService } from './leaderboard-cache.service';
import { LeaderboardService } from './leaderboard.service';

describe('LeaderboardService', () => {
  const tournament = { id: 1 };

  function createService(results: any[]) {
    const prisma = {
      tournaments: {
        findUnique: jest.fn().mockResolvedValue(tournament),
      },
      results: {
        findMany: jest.fn().mockResolvedValue(results),
      },
    };
    const cache = new LeaderboardCacheService();

    return {
      service: new LeaderboardService(prisma as any, cache),
      prisma,
    };
  }

  it('ranks by score, wins, time, createdAt and id, then serves from cache', async () => {
    const rows = [
      result(2, 20, 0, null, '2026-05-03T10:00:00.000Z'),
      result(3, 10, 2, 300, '2026-05-03T10:00:00.000Z'),
      result(1, 10, 1, 200, '2026-05-03T10:00:00.000Z'),
    ];
    const { service, prisma } = createService(rows);

    const first = await service.getLeaderboard('1', { page: 1, limit: 20 });
    const second = await service.getLeaderboard('1', { page: 1, limit: 20 });

    expect(first.items.map((item) => item.id)).toEqual([2, 3, 1]);
    expect(first.items.map((item) => item.rank)).toEqual([1, 2, 3]);
    expect(first.cache).toEqual({
      key: 'tournament:1:leaderboard',
      hit: false,
    });
    expect(second.cache.hit).toBe(true);
    expect(prisma.results.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.results.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar_url: true,
            },
          },
        }),
      }),
    );
  });

  it('paginates and can sort cached rows by wins, time and createdAt', async () => {
    const rows = [
      result(1, 10, 4, 300, '2026-05-03T10:03:00.000Z'),
      result(2, 10, 2, null, '2026-05-03T10:01:00.000Z'),
      result(3, 10, 3, 100, '2026-05-03T10:02:00.000Z'),
    ];
    const { service } = createService(rows);

    await service.getLeaderboard('1', { page: 1, limit: 20 });

    await expect(
      service.getLeaderboard('1', {
        page: 1,
        limit: 2,
        sortBy: 'wins',
        order: 'asc',
      }),
    ).resolves.toMatchObject({
      items: [{ id: 2 }, { id: 3 }],
      pagination: { page: 1, limit: 2, total: 3, pages: 2 },
      sort: { sortBy: 'wins', order: 'asc' },
      cache: { hit: true },
    });

    await expect(
      service.getLeaderboard('1', {
        page: 1,
        limit: 3,
        sortBy: 'time',
        order: 'asc',
      }),
    ).resolves.toMatchObject({
      items: [{ id: 3 }, { id: 1 }, { id: 2 }],
    });

    await expect(
      service.getLeaderboard('1', {
        page: 1,
        limit: 3,
        sortBy: 'createdAt',
        order: 'desc',
      }),
    ).resolves.toMatchObject({
      items: [{ id: 1 }, { id: 3 }, { id: 2 }],
    });
  });

  it('invalidates leaderboard cache', async () => {
    const { service, prisma } = createService([
      result(1, 10, 1, 100, '2026-05-03T10:00:00.000Z'),
    ]);

    await service.getLeaderboard('1', { page: 1, limit: 20 });
    await service.invalidate(1);
    await service.getLeaderboard('1', { page: 1, limit: 20 });

    expect(prisma.results.findMany).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid tournament ids and missing tournaments', async () => {
    const { service, prisma } = createService([]);

    await expect(service.getLeaderboard('abc', {})).rejects.toThrow(
      'Invalid tournamentId',
    );

    prisma.tournaments.findUnique.mockResolvedValueOnce(null);

    await expect(service.getLeaderboard('1', {})).rejects.toThrow(
      'Tournament not found',
    );
  });

  function result(
    id: number,
    score: number,
    wins: number,
    timeMs: number | null,
    createdAt: string,
  ) {
    return {
      id,
      tournament_id: 1,
      user_id: id,
      score,
      wins,
      time_ms: timeMs,
      created_at: new Date(createdAt),
      users: {
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        avatar_url: null,
      },
    };
  }
});
