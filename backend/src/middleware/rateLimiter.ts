import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { TooManyRequestsError } from '../utils/errors';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX, AUTH_RATE_LIMIT_MAX } from '../constants';

/**
 * General API Rate Limiter
 * Limits requests per IP address
 */
export const apiRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args) as Promise<unknown>,
  }),
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req): string => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    next(new TooManyRequestsError());
  },
});

/**
 * Strict rate limiter for auth endpoints
 */
export const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args) as Promise<unknown>,
  }),
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  skipSuccessfulRequests: true,
  keyGenerator: (req): string => {
    return `auth:${req.ip || 'unknown'}`;
  },
  handler: (req, res, next, options) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path,
    });
    next(new TooManyRequestsError('Too many authentication attempts. Please try again later.'));
  },
});

/**
 * Donation creation rate limiter
 */
export const donationRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args) as Promise<unknown>,
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req): string => {
    return `donation:${req.user?.id || req.ip}`;
  },
  handler: (req, res, next, options) => {
    next(new TooManyRequestsError('Too many donations created. Please try again later.'));
  },
});
