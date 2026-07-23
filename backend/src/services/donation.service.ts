import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { donationRepository } from '../repositories/donation.repository';
import { notificationService } from './notification.service';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../utils/errors';
import { CACHE_KEYS, DEFAULT_SEARCH_RADIUS_KM } from '../constants';
import type { FilterOptions } from '../types';
import type { DonationStatus } from '@prisma/client';

export class DonationService {
  async create(data: any, donorId: string) {
    const donation = await donationRepository.create({
      ...data,
      donorId,
      status: 'PENDING',
      preparedAt: data.preparedAt ? new Date(data.preparedAt) : undefined,
      expiryTime: new Date(data.expiryTime),
      pickupStartTime: new Date(data.pickupStartTime),
      pickupEndTime: new Date(data.pickupEndTime),
    });

    await this.calculatePriorityScore(donation.id);
    await notificationService.notifyNearbyNgos(donation);
    logger.info(`Donation created: ${donation.id}`);

    return donation;
  }

  async getById(id: string) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new NotFoundError('Donation not found');
    }
    return donation;
  }

  async list(options: FilterOptions) {
    return donationRepository.list(options);
  }

  async findNearby(lat: number, lng: number, radius: number = DEFAULT_SEARCH_RADIUS_KM, options: FilterOptions) {
    return donationRepository.findNearby(lat, lng, radius, options);
  }

  async getByDonor(donorId: string, options: FilterOptions) {
    return donationRepository.findByDonor(donorId, options);
  }

  async getByNgo(ngoId: string, options: FilterOptions) {
    return donationRepository.findByNgo(ngoId, options);
  }

  async accept(id: string, ngoId: string, userId: string) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    if (donation.status !== 'AVAILABLE') {
      throw new BadRequestError('Donation is no longer available');
    }

    const ngo = await prisma.ngoProfile.findUnique({ where: { id: ngoId } });
    if (!ngo) {
      throw new NotFoundError('NGO not found');
    }

    if (ngo.verificationStatus !== 'VERIFIED') {
      throw new ForbiddenError('NGO must be verified to accept donations');
    }

    const updated = await donationRepository.accept(id, ngoId);

    await notificationService.create({
      userId: donation.donorId,
      type: 'DONATION_ACCEPTED',
      title: 'Donation Accepted',
      message: `${ngo.organizationName} has accepted your donation.`,
      donationId: id,
    });

    await redis.del(CACHE_KEYS.DONATION(id));
    return updated;
  }

  async cancel(id: string, userId: string, reason?: string) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    if (donation.donorId !== userId) {
      throw new ForbiddenError('Only the donor can cancel this donation');
    }

    if (donation.status === 'DELIVERED' || donation.status === 'CANCELLED') {
      throw new BadRequestError('Cannot cancel this donation');
    }

    const updated = await donationRepository.cancel(id, reason);

    if (donation.ngoId) {
      await notificationService.create({
        userId: donation.donorId,
        type: 'SYSTEM',
        title: 'Donation Cancelled',
        message: `A donation has been cancelled. Reason: ${reason || 'No reason provided'}`,
      });
    }

    await redis.del(CACHE_KEYS.DONATION(id));
    return updated;
  }

  async updateStatus(id: string, status: DonationStatus) {
    const updated = await donationRepository.updateStatus(id, status);
    if (status === 'DELIVERED') {
      await this.updateDeliveryStats(id);
    }
    await redis.del(CACHE_KEYS.DONATION(id));
    return updated;
  }

  async update(id: string, data: any, userId: string) {
    const donation = await donationRepository.findById(id);
    if (!donation) {
      throw new NotFoundError('Donation not found');
    }

    if (donation.donorId !== userId) {
      throw new ForbiddenError('Only the donor can update this donation');
    }

    const updated = await donationRepository.update(id, data);
    await redis.del(CACHE_KEYS.DONATION(id));
    return updated;
  }

  private async calculatePriorityScore(donationId: string) {
    const donation = await donationRepository.findById(donationId);
    if (!donation) return;

    const now = new Date();
    const expiry = new Date(donation.expiryTime);
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);

    let score = 50;
    if (hoursUntilExpiry < 2) score += 30;
    else if (hoursUntilExpiry < 6) score += 15;
    if (donation.quantity > 50) score += 10;
    if (donation.foodCategory === 'COOKED_MEAL') score += 10;

    await prisma.donation.update({
      where: { id: donationId },
      data: { priorityScore: Math.min(score, 100) },
    });
  }

  private async updateDeliveryStats(donationId: string) {
    const donation = await donationRepository.findById(donationId);
    if (!donation) return;

    await prisma.donorProfile.update({
      where: { userId: donation.donorId },
      data: {
        totalFoodWeight: { increment: donation.quantity },
        totalPeopleFed: { increment: donation.servings || 0 },
      },
    });

    if (donation.ngoId) {
      await prisma.ngoProfile.update({
        where: { id: donation.ngoId },
        data: {
          totalReceived: { increment: 1 },
          totalPeopleFed: { increment: donation.servings || 0 },
        },
      });
    }
  }

  async getExpiredDonations() {
    return donationRepository.getExpired();
  }
}

export const donationService = new DonationService();
