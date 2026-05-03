import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

type CacheItem = {
  expiresAt: number;
  value: string;
};

@Injectable()
export class LeaderboardCacheService implements OnModuleDestroy {
  private readonly memory = new Map<string, CacheItem>();
  private client: RedisClientType | null = null;
  private connectPromise: Promise<RedisClientType | null> | null = null;

  async get<T>(key: string): Promise<T | null> {
    const redis = await this.getRedisClient();

    if (redis) {
      const value = await redis.get(key);
      return value ? (JSON.parse(value) as T) : null;
    }

    const item = this.memory.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.memory.delete(key);
      return null;
    }

    return JSON.parse(item.value) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    const redis = await this.getRedisClient();

    if (redis) {
      await redis.set(key, serialized, { EX: ttlSeconds });
      return;
    }

    this.memory.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    const redis = await this.getRedisClient();

    if (redis) {
      await redis.del(key);
      return;
    }

    this.memory.delete(key);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }

  private async getRedisClient(): Promise<RedisClientType | null> {
    if (!process.env.REDIS_URL) {
      return null;
    }

    if (this.client?.isOpen) {
      return this.client;
    }

    if (!this.connectPromise) {
      this.connectPromise = this.connectRedis();
    }

    return this.connectPromise;
  }

  private async connectRedis(): Promise<RedisClientType | null> {
    try {
      const client = createClient({ url: process.env.REDIS_URL });
      client.on('error', () => undefined);
      await client.connect();
      this.client = client as RedisClientType;
      return this.client;
    } catch {
      this.connectPromise = null;
      return null;
    }
  }
}
