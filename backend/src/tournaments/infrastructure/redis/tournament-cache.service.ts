import { Injectable } from '@nestjs/common';
import { CachePort } from '../../application/ports/cache.port';

@Injectable()
export class TournamentCacheService implements CachePort {
  private readonly store = new Map<
    string,
    { expiresAt: number; value: unknown }
  >();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}
