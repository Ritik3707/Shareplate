import { z } from 'zod';

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    isRead: z.string().transform((v) => v === 'true').optional(),
    type: z.string().optional(),
  }),
});

export const markReadSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid()).optional(),
    markAll: z.boolean().default(false),
  }),
});

export const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID'),
  }),
});
