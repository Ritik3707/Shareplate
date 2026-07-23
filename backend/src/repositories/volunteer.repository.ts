import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { FilterOptions } from '../types';
import { getPaginationParams, getSortParams } from '../utils/helpers';
import type { Prisma, VolunteerProfile } from '@prisma/client';

export class VolunteerRepository {
  async findById(id: string): Promise<VolunteerProfile | null> {
    return prisma.volunteerProfile.findUnique({
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
          },
        },
        ngos: {
          include: {
            ngo: {
              select: { organizationName: true },
            },
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<VolunteerProfile | null> {
    return prisma.volunteerProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  async create(data: Prisma.VolunteerProfileCreateInput): Promise<VolunteerProfile> {
    const volunteer = await prisma.volunteerProfile.create({ data });
    logger.info(`Volunteer profile created: ${volunteer.id}`);
    return volunteer;
  }

  async update(id: string, data: Prisma.VolunteerProfileUpdateInput): Promise<VolunteerProfile> {
    return prisma.volunteerProfile.update({
      where: { id },
      data,
    });
  }

  async updateLocation(userId: string, lat: number, lng: number): Promise<VolunteerProfile> {
    return prisma.volunteerProfile.update({
      where: { userId },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastLocationAt: new Date(),
      },
    });
  }

  async list(options: FilterOptions): Promise<{ volunteers: VolunteerProfile[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const where: Prisma.VolunteerProfileWhereInput = {};

    if (options.available !== undefined) {
      where.available = options.available;
    }

    const [volunteers, total] = await Promise.all([
      prisma.volunteerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      }),
      prisma.volunteerProfile.count({ where }),
    ]);

    return { volunteers, total };
  }

  async findNearby(lat: number, lng: number, radius: number, options: FilterOptions): Promise<{ volunteers: VolunteerProfile[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);

    const volunteers = await prisma.$queryRaw<VolunteerProfile[]>`
      SELECT v.*, u.latitude, u.longitude,
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(v."currentLat")) *
          cos(radians(v."currentLng") - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(v."currentLat"))
        )) AS distance
      FROM volunteer_profiles v
      JOIN users u ON v."userId" = u.id
      WHERE v.available = true
      HAVING distance <= ${radius}
      ORDER BY v.rating DESC, distance ASC
      LIMIT ${limit} OFFSET ${skip}
    `;

    const totalResult = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count FROM (
        SELECT v.id,
          (6371 * acos(
            cos(radians(${lat})) * cos(radians(v."currentLat")) *
            cos(radians(v."currentLng") - radians(${lng})) +
            sin(radians(${lat})) * sin(radians(v."currentLat"))
          )) AS distance
        FROM volunteer_profiles v
        WHERE v.available = true
        HAVING distance <= ${radius}
      ) AS nearby
    `;

    return { volunteers, total: Number(totalResult[0]?.count || 0) };
  }

  async updateStats(id: string, stats: { pickups?: number; deliveries?: number; distance?: number }): Promise<VolunteerProfile> {
    return prisma.volunteerProfile.update({
      where: { id },
      data: {
        totalPickups: stats.pickups ? { increment: stats.pickups } : undefined,
        totalDeliveries: stats.deliveries ? { increment: stats.deliveries } : undefined,
        totalDistance: stats.distance ? { increment: stats.distance } : undefined,
      },
    });
  }
}

export const volunteerRepository = new VolunteerRepository();
