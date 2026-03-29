/**
 * redis.config.ts
 *
 * NestJS namespaced configuration for Redis (cache, BullMQ, sessions).
 *
 * Usage
 * ─────
 * constructor(
 *   @Inject(redisConfig.KEY)
 *   private readonly redis: ConfigType<typeof redisConfig>,
 * ) {}
 */

import { registerAs } from '@nestjs/config';
import { RedisSchema } from '../env.schema';

export const redisConfig = registerAs('redis', () => {
  const env = RedisSchema.parse(process.env);

  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
    tls: env.REDIS_TLS,
    cache: {
      ttlSeconds: env.REDIS_CACHE_TTL_SECONDS,
    },
    queue: {
      maxAttempts: env.QUEUE_MAX_ATTEMPTS,
      backoffMs: env.QUEUE_BACKOFF_MS,
    },

    /** ioredis-compatible connection options */
    get ioredisOptions() {
      return {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD ?? undefined,
        db: env.REDIS_DB,
        tls: env.REDIS_TLS ? {} : undefined,
        lazyConnect: false,
        keepAlive: 30_000,
        retryStrategy: (times: number) =>
          Math.min(times * 1_000, 10_000),
      } as const;
    },
  } as const;
});

export type RedisConfig = ReturnType<typeof redisConfig>;
