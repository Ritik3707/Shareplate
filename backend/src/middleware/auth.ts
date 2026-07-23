import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { verifyAccessToken } from '../utils/helpers';
import { CACHE_KEYS } from '../constants';
import type { TokenPayload } from '../types';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    // Check blacklist
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }

    const decoded = verifyAccessToken(token);

    // Check cache first
    const cacheKey = CACHE_KEYS.USER(decoded.userId);
    let user = await redis.get(cacheKey);

    if (user) {
      req.user = JSON.parse(user);
      return next();
    }

    // Fetch from database
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
        adminProfile: true,
      },
    });

    if (!dbUser) {
      throw new UnauthorizedError('User not found');
    }

    if (dbUser.status === 'SUSPENDED' || dbUser.status === 'BANNED') {
      throw new ForbiddenError('Account has been suspended');
    }

    // Cache user for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(dbUser));

    req.user = dbUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Role-based Authorization Middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Role authorization failed: ${req.user.role} not in [${roles.join(', ')}]`, {
        userId: req.user.id,
        path: req.path,
      });
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * Attaches user if token valid, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
        adminProfile: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = user;
    }

    next();
  } catch {
    // Silently fail for optional auth
    next();
  }
};

/**
 * Admin-only middleware
 */
export const requireAdmin = authorize('ADMIN');

/**
 * Donor-only middleware
 */
export const requireDonor = authorize('DONOR', 'ADMIN');

/**
 * NGO-only middleware
 */
export const requireNgo = authorize('NGO', 'ADMIN');

/**
 * Volunteer-only middleware
 */
export const requireVolunteer = authorize('VOLUNTEER', 'ADMIN');

/**
 * Donor or NGO middleware
 */
export const requireDonorOrNgo = authorize('DONOR', 'NGO', 'ADMIN');
