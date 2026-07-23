import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { CACHE_KEYS } from '../constants';
import type { FilterOptions } from '../types';
import { getPaginationParams, getSortParams } from '../utils/helpers';
import type { Prisma, User } from '@prisma/client';

/**
 * User Repository
 * Handles all database operations for users
 */
export class UserRepository {
  /**
   * Find user by ID with caching
   */
  async findById(id: string): Promise<User | null> {
    const cacheKey = CACHE_KEYS.USER(id);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
        adminProfile: true,
      },
    });

    if (user) {
      await redis.setex(cacheKey, 3600, JSON.stringify(user));
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        donorProfile: true,
        ngoProfile: true,
        volunteerProfile: true,
        adminProfile: true,
      },
    });
  }

  /**
   * Find user by Google ID
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { googleId },
    });
  }

  /**
   * Create new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const user = await prisma.user.create({ data });
    logger.info(`User created: ${user.id}`);
    return user;
  }

  /**
   * Update user
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    // Invalidate cache
    await redis.del(CACHE_KEYS.USER(id));

    return user;
  }

  /**
   * Delete user (soft delete)
   */
  async softDelete(id: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE', deletedAt: new Date() },
    });

    await redis.del(CACHE_KEYS.USER(id));
    logger.info(`User soft deleted: ${id}`);
    return user;
  }

  /**
   * List users with pagination and filtering
   */
  async list(options: FilterOptions): Promise<{ users: User[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const where: Prisma.UserWhereInput = {};

    if (options.status) {
      where.status = options.status as any;
    }

    if (options.role) {
      where.role = options.role as any;
    }

    if (options.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort,
        include: {
          donorProfile: true,
          ngoProfile: true,
          volunteerProfile: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Update last login
   */
  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  }
}

export const userRepository = new UserRepository();
