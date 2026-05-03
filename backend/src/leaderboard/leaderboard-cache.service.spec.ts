import { createClient } from 'redis';
import { LeaderboardCacheService } from './leaderboard-cache.service';

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

describe('LeaderboardCacheService', () => {
  const originalRedisUrl = process.env.REDIS_URL;

  afterEach(() => {
    process.env.REDIS_URL = originalRedisUrl;
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('uses memory cache when REDIS_URL is not configured', async () => {
    delete process.env.REDIS_URL;
    const service = new LeaderboardCacheService();

    await expect(service.get('missing')).resolves.toBeNull();

    await service.set('leaderboard', { items: [1] }, 60);
    await expect(service.get('leaderboard')).resolves.toEqual({ items: [1] });

    await service.del('leaderboard');
    await expect(service.get('leaderboard')).resolves.toBeNull();
  });

  it('expires memory cache entries', async () => {
    delete process.env.REDIS_URL;
    jest.useFakeTimers();
    const service = new LeaderboardCacheService();

    await service.set('leaderboard', { items: [1] }, 1);
    jest.advanceTimersByTime(1001);

    await expect(service.get('leaderboard')).resolves.toBeNull();
  });

  it('uses redis when configured', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const client = {
      isOpen: true,
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      quit: jest.fn().mockResolvedValue('OK'),
      on: jest.fn(),
    };
    jest.mocked(createClient).mockReturnValue(client as any);
    const service = new LeaderboardCacheService();

    await expect(service.get('key')).resolves.toEqual({ ok: true });
    await service.set('key', { ok: true }, 10);
    await service.del('key');
    await service.onModuleDestroy();

    expect(createClient).toHaveBeenCalledWith({ url: 'redis://localhost:6379' });
    expect(client.set).toHaveBeenCalledWith('key', JSON.stringify({ ok: true }), { EX: 10 });
    expect(client.del).toHaveBeenCalledWith('key');
    expect(client.quit).toHaveBeenCalled();
  });

  it('falls back to memory cache when redis connection fails', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    const client = {
      connect: jest.fn().mockRejectedValue(new Error('down')),
      on: jest.fn(),
    };
    jest.mocked(createClient).mockReturnValue(client as any);
    const service = new LeaderboardCacheService();

    await service.set('key', { ok: true }, 10);

    await expect(service.get('key')).resolves.toEqual({ ok: true });
  });
});
