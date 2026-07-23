import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { FilterOptions } from '../types';
import { getPaginationParams, getSortParams } from '../utils/helpers';
import type { Prisma, PickupRequest } from '@prisma/client';

export class PickupRepository {
  async findById(id: string): Promise<PickupRequest | null> {
    return prisma.pickupRequest.findUnique({
      where: { id },
      include: {
        donation: {
          include: {
            images: true,
            donor: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
        volunteer: {
          select: { id: true, firstName: true, lastName: true, phone: true, avatar: true },
        },
      },
    });
  }

  async create(data: Prisma.PickupRequestCreateInput): Promise<PickupRequest> {
    const pickup = await prisma.pickupRequest.create({ data });
    logger.info(`Pickup request created: ${pickup.id}`);
    return pickup;
  }

  async update(id: string, data: Prisma.PickupRequestUpdateInput): Promise<PickupRequest> {
    return prisma.pickupRequest.update({
      where: { id },
      data,
    });
  }

  async assignVolunteer(id: string, volunteerId: string): Promise<PickupRequest> {
    return prisma.pickupRequest.update({
      where: { id },
      data: {
        volunteerId,
        status: 'ASSIGNED',
      },
    });
  }

  async acceptPickup(id: string, volunteerId: string): Promise<PickupRequest> {
    return prisma.pickupRequest.update({
      where: { id },
      data: {
        volunteerId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<PickupRequest> {
    const data: any = { status };

    if (status === 'PICKED_UP') {
      data.pickedUpAt = new Date();
    } else if (status === 'DELIVERED') {
      data.deliveredAt = new Date();
    }

    return prisma.pickupRequest.update({
      where: { id },
      data,
    });
  }

  async verifyPickup(id: string, data: { pickupVerified?: boolean; deliveryVerified?: boolean; photoUrl?: string; signature?: string }): Promise<PickupRequest> {
    return prisma.pickupRequest.update({
      where: { id },
      data: {
        pickupVerified: data.pickupVerified,
        deliveryVerified: data.deliveryVerified,
        pickupPhotoUrl: data.photoUrl,
        pickupSignature: data.signature,
      },
    });
  }

  async list(options: FilterOptions): Promise<{ pickups: PickupRequest[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const where: Prisma.PickupRequestWhereInput = {};

    if (options.status) {
      where.status = options.status as any;
    }

    if (options.donationId) {
      where.donationId = options.donationId;
    }

    if (options.volunteerId) {
      where.volunteerId = options.volunteerId;
    }

    const [pickups, total] = await Promise.all([
      prisma.pickupRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort,
        include: {
          donation: {
            include: {
              images: true,
              donor: { select: { firstName: true, lastName: true } },
            },
          },
          volunteer: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      prisma.pickupRequest.count({ where }),
    ]);

    return { pickups, total };
  }

  async findByVolunteer(volunteerId: string, options: FilterOptions): Promise<{ pickups: PickupRequest[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const [pickups, total] = await Promise.all([
      prisma.pickupRequest.findMany({
        where: { volunteerId },
        skip,
        take: limit,
        orderBy: sort,
        include: {
          donation: {
            include: {
              images: true,
              donor: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
        },
      }),
      prisma.pickupRequest.count({ where: { volunteerId } }),
    ]);

    return { pickups, total };
  }

  async findPending(): Promise<PickupRequest[]> {
    return prisma.pickupRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        donation: {
          include: {
            donor: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }
}

export const pickupRepository = new PickupRepository();
