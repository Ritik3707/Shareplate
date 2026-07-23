import { prisma } from '../config/database';
import { notificationRepository } from '../repositories/notification.repository';
import { firebase } from '../config/firebase';
import { logger } from '../config/logger';
import type { NotificationPayload, FilterOptions } from '../types';

export class NotificationService {
  async create(payload: NotificationPayload) {
    const notification = await notificationRepository.create({
      userId: payload.userId,
      type: payload.type as any,
      title: payload.title,
      message: payload.message,
      data: payload.data ? JSON.stringify(payload.data) : null,
      channels: ['IN_APP'] as any,
    });

    await this.sendPushNotification(payload);
    return notification;
  }

  async createMany(payloads: NotificationPayload[]) {
    const data = payloads.map((p) => ({
      userId: p.userId,
      type: p.type as any,
      title: p.title,
      message: p.message,
      data: p.data ? JSON.stringify(p.data) : null,
      channels: ['IN_APP'] as any,
    }));

    await notificationRepository.createMany(data);
  }

  async notifyNearbyNgos(donation: any) {
    const nearbyNgos = await prisma.$queryRaw<any[]>`
      SELECT n.id, n."userId"
      FROM ngo_profiles n
      JOIN users u ON n."userId" = u.id
      WHERE n."verificationStatus" = 'VERIFIED'
      AND (6371 * acos(
        cos(radians(${donation.pickupLatitude})) * cos(radians(u.latitude)) *
        cos(radians(u.longitude) - radians(${donation.pickupLongitude})) +
        sin(radians(${donation.pickupLatitude})) * sin(radians(u.latitude))
      )) <= n."serviceRadius"
    `;

    const notifications = nearbyNgos.map((ngo) => ({
      userId: ngo.userId,
      type: 'DONATION_CREATED',
      title: 'New Donation Available',
      message: `A new ${donation.foodType.toLowerCase()} donation is available near you.`,
      donationId: donation.id,
    }));

    await this.createMany(notifications);
  }

  async listByUser(userId: string, options: FilterOptions) {
    return notificationRepository.listByUser(userId, options);
  }

  async markAsRead(userId: string, ids?: string[]) {
    await notificationRepository.markAsRead(userId, ids);
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.getUnreadCount(userId);
  }

  private async sendPushNotification(payload: NotificationPayload) {
    if (!firebase) return;
    try {
      // Push notification logic would go here with FCM tokens
    } catch (error) {
      logger.error('Push notification error:', error);
    }
  }
}

export const notificationService = new NotificationService();
