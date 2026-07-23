import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { FilterOptions } from '../types';
import { getPaginationParams, getSortParams } from '../utils/helpers';
import type { Prisma, Payment } from '@prisma/client';

export class PaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findByStripeId(stripePaymentIntentId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { stripePaymentIntentId },
    });
  }

  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    const payment = await prisma.payment.create({ data });
    logger.info(`Payment created: ${payment.id}`);
    return payment;
  }

  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: string): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async list(options: FilterOptions): Promise<{ payments: Payment[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const where: Prisma.PaymentWhereInput = {};

    if (options.status) {
      where.status = options.status as any;
    }

    if (options.userId) {
      where.userId = options.userId;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  async findByUser(userId: string, options: FilterOptions): Promise<{ payments: Payment[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: sort,
      }),
      prisma.payment.count({ where: { userId } }),
    ]);

    return { payments, total };
  }
}

export const paymentRepository = new PaymentRepository();
