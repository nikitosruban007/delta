import { ResultsService } from './results.service';

describe('ResultsService', () => {
  function mappedResult(overrides: Record<string, unknown> = {}) {
    return {
      id: 1,
      tournament_id: 5,
      user_id: 7,
      score: 42,
      wins: 3,
      time_ms: 1200,
      created_at: new Date('2026-05-03T10:00:00.000Z'),
      users: {
        id: 7,
        name: 'Ada',
        email: 'ada@example.com',
        avatar_url: null,
      },
      ...overrides,
    };
  }

  function createService() {
    const prisma = {
      $transaction: jest.fn((queries) => Promise.all(queries)),
      tournaments: {
        findUnique: jest.fn().mockResolvedValue({ id: 5 }),
      },
      users: {
        findUnique: jest.fn().mockResolvedValue({ id: 7 }),
      },
      results: {
        upsert: jest.fn().mockResolvedValue(mappedResult()),
        findMany: jest.fn().mockResolvedValue([mappedResult()]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    const leaderboard = { invalidate: jest.fn().mockResolvedValue(undefined) };

    return {
      service: new ResultsService(prisma as any, leaderboard as any),
      prisma,
      leaderboard,
    };
  }

  it('upserts one result per tournament/user and invalidates leaderboard cache', async () => {
    const { service, prisma, leaderboard } = createService();

    const result = await service.createResult('5', {
      userId: 7,
      score: 42,
      wins: 3,
      timeMs: 1200,
    });

    expect(prisma.results.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tournament_id_user_id: {
            tournament_id: 5,
            user_id: 7,
          },
        },
      }),
    );
    expect(leaderboard.invalidate).toHaveBeenCalledWith(5);
    expect(result).toMatchObject({
      tournamentId: 5,
      userId: 7,
      score: 42,
      user: { id: 7, name: 'Ada' },
    });
  });

  it('uses zero wins by default when creating a result', async () => {
    const { service, prisma } = createService();

    await service.createResult('5', {
      userId: 7,
      score: 42,
    });

    expect(prisma.results.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ wins: 0 }),
        update: expect.objectContaining({ wins: 0 }),
      }),
    );
  });

  it('lists paginated results with a single transaction', async () => {
    const { service, prisma } = createService();

    const results = await service.listResults('5', { page: 2, limit: 10 });

    expect(prisma.results.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tournament_id: 5 },
        skip: 10,
        take: 10,
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
    expect(prisma.results.count).toHaveBeenCalledWith({
      where: { tournament_id: 5 },
    });
    expect(results).toMatchObject({
      items: [{ id: 1, user: { email: 'ada@example.com' } }],
      pagination: { page: 2, limit: 10, total: 1, pages: 1 },
    });
  });

  it('rejects invalid ids and missing relations', async () => {
    const { service, prisma } = createService();

    await expect(service.createResult('nope', { userId: 7, score: 1 })).rejects.toThrow(
      'Invalid tournamentId',
    );

    prisma.tournaments.findUnique.mockResolvedValueOnce(null);
    await expect(service.createResult('5', { userId: 7, score: 1 })).rejects.toThrow(
      'Tournament not found',
    );

    prisma.users.findUnique.mockResolvedValueOnce(null);
    await expect(service.createResult('5', { userId: 7, score: 1 })).rejects.toThrow(
      'User not found',
    );
  });
});
