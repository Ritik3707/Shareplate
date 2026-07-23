import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { CACHE_KEYS } from '../constants';
import type { FilterOptions } from '../types';
import { getPaginationParams, getSortParams, calculateDistance } from '../utils/helpers';
import type { Prisma, Donation } from '@prisma/client';

/**
 * Donation Repository
 * Handles all database operations for donations
 */
export class DonationRepository {
  /**
   * Find donation by ID
   */
  async findById(id: string): Promise<Donation | null> {
    const cacheKey = CACHE_KEYS.DONATION(id);
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        images: true,
        donor: {
          select: { id: true, firstName: true, lastName: true, avatar: true, phone: true },
        },
        ngo: true,
        pickupRequests: {
          include: {
            volunteer: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
        reviews: true,
      },
    });

    if (donation) {
      await redis.setex(cacheKey, 1800, JSON.stringify(donation));
    }

    return donation;
  }

  /**
   * Create donation
   */
  async create(data: Prisma.DonationCreateInput): Promise<Donation> {
    const donation = await prisma.donation.create({ data });
    logger.info(`Donation created: ${donation.id}`);
    return donation;
  }

  /**
   * Update donation
   */
  async update(id: string, data: Prisma.DonationUpdateInput): Promise<Donation> {
    const donation = await prisma.donation.update({
      where: { id },
      data,
    });

    await redis.del(CACHE_KEYS.DONATION(id));
    return donation;
  }

  /**
   * List donations with filtering
   */
  async list(options: FilterOptions): Promise<{ donations: Donation[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const where: Prisma.DonationWhereInput = {};

    if (options.status) {
      where.status = options.status as any;
    }

    if (options.foodType) {
      where.foodType = options.foodType as any;
    }

    if (options.category) {
      where.foodCategory = options.category as any;
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) where.createdAt.gte = new Date(options.startDate);
      if (options.endDate) where.createdAt.lte = new Date(options.endDate);
    }

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort,
        include: {
          images: true,
          donor: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          ngo: {
            select: { organizationName: true },
          },
        },
      }),
      prisma.donation.count({ where }),
    ]);

    return { donations, total };
  }

  /**
   * Find nearby donations
   */
  async findNearby(
    lat: number,
    lng: number,
    radius: number,
    options: FilterOptions
  ): Promise<{ donations: Donation[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);

    // Use raw query for geo distance calculation
    const donations = await prisma.$queryRaw<Donation[]>`
      SELECT d.*, 
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(d."pickupLatitude")) *
          cos(radians(d."pickupLongitude") - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(d."pickupLatitude"))
        )) AS distance
      FROM donations d
      WHERE d.status = 'AVAILABLE'
        AND d."expiryTime" > NOW()
      HAVING distance <= ${radius}
      ORDER BY d."priorityScore" DESC, distance ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count FROM (
        SELECT d.id,
          (6371 * acos(
            cos(radians(${lat})) * cos(radians(d."pickupLatitude")) *
            cos(radians(d."pickupLongitude") - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(d."pickupLatitude"))
          )) AS distance
        FROM donations d
        WHERE d.status = 'AVAILABLE'
          AND d."expiryTime" > NOW()
        HAVING distance <= ${radius}
      ) AS nearby
    `;

    return { donations, total: Number(totalResult[0]?.count || 0) };
  }

  /**
   * Get donations by donor
   */
  async findByDonor(donorId: string, options: FilterOptions): Promise<{ donations: Donation[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: { donorId },
        skip,
        take: limit,
        orderBy: sort,
        include: {
          images: true,
          ngo: { select: { organizationName: true } },
          pickupRequests: {
            include: {
              volunteer: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      prisma.donation.count({ where: { donorId } }),
    ]);

    return { donations, total };
  }

  /**
   * Get donations by NGO
   */
  async findByNgo(ngoId: string, options: FilterOptions): Promise<{ donations: Donation[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where: { ngoId },
        skip,
        take: limit,
        orderBy: sort,
        include: {
          images: true,
          donor: { select: { firstName: true, lastName: true } },
          pickupRequests: true,
        },
      }),
      prisma.donation.count({ where: { ngoId } }),
    ]);

    return { donations, total };
  }

  /**
   * Accept donation
   */
  async accept(id: string, ngoId: string): Promise<Donation> {
    const donation = await prisma.donation.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        ngoId,
        acceptedAt: new Date(),
      },
    });

    await redis.del(CACHE_KEYS.DONATION(id));
    return donation;
  }

  /**
   * Cancel donation
   */
  async cancel(id: string, reason?: string): Promise<Donation> {
    const donation = await prisma.donation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledReason: reason,
      },
    });

    await redis.del(CACHE_KEYS.DONATION(id));
    return donation;
  }

  /**
   * Get expired donations
   */
  async getExpired(): Promise<Donation[]> {
    return prisma.donation.findMany({
      where: {
        status: 'AVAILABLE',
        expiryTime: { lt: new Date() },
      },
    });
  }

  /**
   * Update donation status
   */
  async updateStatus(id: string, status: string): Promise<Donation> {
    const donation = await prisma.donation.update({
      where: { id },
      data: { status: status as any },
    });

    await redis.del(CACHE_KEYS.DONATION(id));
    return donation;
  }
}

export const donationRepository = new DonationRepository();
