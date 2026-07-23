import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { CACHE_KEYS } from '../constants';
import type { FilterOptions } from '../types';
import { getPaginationParams } from '../utils/helpers';
import type { Prisma, Notification } from '@prisma/client';

export class NotificationRepository {
  async findById(id: string): Promise<Notification | null> {
    return prisma.notification.findUnique({ where: { id } });
  }

  async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    const notification = await prisma.notification.create({ data });

    // Invalidate cache
    await redis.del(CACHE_KEYS.NOTIFICATIONS(data.userId as string));

    return notification;
  }

  async createMany(data: Prisma.NotificationCreateManyInput[]): Promise<void> {
    await prisma.notification.createMany({ data });
  }

  async listByUser(userId: string, options: FilterOptions): Promise<{ notifications: Notification[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);

    const where: Prisma.NotificationWhereInput = { userId };

    if (options.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    if (options.type) {
      where.type = options.type as any;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async markAsRead(userId: string, ids?: string[]): Promise<void> {
    const where: Prisma.NotificationWhereInput = { userId, isRead: false };

    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }

    await prisma.notification.updateMany({
      where,
      data: { isRead: true, readAt: new Date() },
    });

    await redis.del(CACHE_KEYS.NOTIFICATIONS(userId));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    await redis.del(CACHE_KEYS.NOTIFICATIONS(userId));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.notification.delete({ where: { id } });
  }
}

export const notificationRepository = new NotificationRepository();
