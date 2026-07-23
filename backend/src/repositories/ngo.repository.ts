import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import type { FilterOptions } from '../types';
import { getPaginationParams, getSortParams } from '../utils/helpers';
import type { Prisma, NgoProfile } from '@prisma/client';

export class NgoRepository {
  async findById(id: string): Promise<NgoProfile | null> {
    return prisma.ngoProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            latitude: true,
            longitude: true,
            address: true,
            city: true,
            state: true,
            country: true,
          },
        },
        volunteers: {
          include: {
            volunteer: {
              include: {
                user: {
                  select: { firstName: true, lastName: true, avatar: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<NgoProfile | null> {
    return prisma.ngoProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async create(data: Prisma.NgoProfileCreateInput): Promise<NgoProfile> {
    const ngo = await prisma.ngoProfile.create({ data });
    logger.info(`NGO profile created: ${ngo.id}`);
    return ngo;
  }

  async update(id: string, data: Prisma.NgoProfileUpdateInput): Promise<NgoProfile> {
    return prisma.ngoProfile.update({
      where: { id },
      data,
    });
  }

  async list(options: FilterOptions): Promise<{ ngos: NgoProfile[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const where: Prisma.NgoProfileWhereInput = {};

    if (options.verificationStatus) {
      where.verificationStatus = options.verificationStatus as any;
    }

    if (options.search) {
      where.OR = [
        { organizationName: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [ngos, total] = await Promise.all([
      prisma.ngoProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              latitude: true,
              longitude: true,
            },
          },
          _count: { select: { receivedDonations: true, volunteers: true } },
        },
      }),
      prisma.ngoProfile.count({ where }),
    ]);

    return { ngos, total };
  }

  async verify(id: string, status: string, verifiedBy: string): Promise<NgoProfile> {
    return prisma.ngoProfile.update({
      where: { id },
      data: {
        verificationStatus: status as any,
        verifiedAt: status === 'VERIFIED' ? new Date() : undefined,
        verifiedBy: status === 'VERIFIED' ? verifiedBy : undefined,
      },
    });
  }

  async findNearby(lat: number, lng: number, radius: number, options: FilterOptions): Promise<{ ngos: NgoProfile[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);

    const ngos = await prisma.$queryRaw<NgoProfile[]>`
      SELECT n.*, u.latitude, u.longitude,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(u.latitude))
        )) AS distance
      FROM ngo_profiles n
      JOIN users u ON n."userId" = u.id
      WHERE n."verificationStatus" = 'VERIFIED'
      HAVING distance <= ${radius}
      ORDER BY n.rating DESC, distance ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count FROM (
        SELECT n.id,
          (6371 * acos(
            cos(radians(${lat})) * cos(radians(u.latitude)) *
            cos(radians(u.longitude) - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(u.latitude))
          )) AS distance
        FROM ngo_profiles n
        JOIN users u ON n."userId" = u.id
        WHERE n."verificationStatus" = 'VERIFIED'
        HAVING distance <= ${radius}
      ) AS nearby
    `;

    return { ngos, total: Number(totalResult[0]?.count || 0) };
  }

  async updateStats(id: string, stats: { totalReceived?: number; totalDistributed?: number; totalPeopleFed?: number }): Promise<NgoProfile> {
    return prisma.ngoProfile.update({
      where: { id },
      data: {
        totalReceived: stats.totalReceived ? { increment: stats.totalReceived } : undefined,
        totalDistributed: stats.totalDistributed ? { increment: stats.totalDistributed } : undefined,
        totalPeopleFed: stats.totalPeopleFed ? { increment: stats.totalPeopleFed } : undefined,
      },
    });
  }
}

export const ngoRepository = new NgoRepository();
