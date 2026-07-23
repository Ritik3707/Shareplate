import Redis from 'ioredis';

/**
 * Redis Client Configuration
 * Handles caching, session storage, rate limiting, and real-time data
 */
class RedisClient {
  private static instance: Redis;

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      RedisClient.instance = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err: Error) => {
          const targetErrors = ['READONLY', 'ECONNREFUSED', 'ETIMEDOUT'];
          return targetErrors.some(e => err.message.includes(e));
        },
      });

      RedisClient.instance.on('connect', () => {
        console.log('Redis client connected');
      });

      RedisClient.instance.on('error', (err: Error) => {
        console.error('Redis client error:', err.message);
      });

      RedisClient.instance.on('reconnecting', () => {
        console.log('Redis client reconnecting...');
      });
    }

    return RedisClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null as unknown as Redis;
    }
  }
}

export const redis = RedisClient.getInstance();
export default RedisClient;
