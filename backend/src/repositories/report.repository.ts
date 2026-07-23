import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { FilterOptions } from '../types';
import { getPaginationParams, getSortParams } from '../utils/helpers';
import type { Prisma, Report } from '@prisma/client';

export class ReportRepository {
  async findById(id: string): Promise<Report | null> {
    return prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async create(data: Prisma.ReportCreateInput): Promise<Report> {
    const report = await prisma.report.create({ data });
    logger.info(`Report created: ${report.id}`);
    return report;
  }

  async update(id: string, data: Prisma.ReportUpdateInput): Promise<Report> {
    return prisma.report.update({
      where: { id },
      data,
    });
  }

  async list(options: FilterOptions): Promise<{ reports: Report[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);
    const sort = getSortParams(options);

    const where: Prisma.ReportWhereInput = {};

    if (options.status) {
      where.status = options.status as any;
    }

    if (options.type) {
      where.type = options.type as any;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort,
        include: {
          reporter: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total };
  }

  async resolve(id: string, resolvedBy: string, resolution: string): Promise<Report> {
    return prisma.report.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedBy,
        resolvedAt: new Date(),
        resolution,
      },
    });
  }
}

export const reportRepository = new ReportRepository();
