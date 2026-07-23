import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { AuditAction } from '@prisma/client';

/**
 * Audit Log Middleware
 * Logs actions for audit trail
 */
export const auditLog = (action: AuditAction, entityType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function(body: unknown): Response {
      // Restore original method
      res.json = originalJson;

      // Log after response is sent
      if (req.user && res.statusCode < 400) {
        prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            entityType,
            entityId: req.params.id,
            oldData: req.body ? JSON.stringify(req.body) : null,
            newData: body ? JSON.stringify(body) : null,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        }).catch((err) => {
          logger.error('Audit log creation failed:', err);
        });
      }

      return originalJson(body);
    };

    next();
  };
};
