import { z } from 'zod';

export const createReportSchema = z.object({
  body: z.object({
    type: z.enum(['FRAUD', 'SPAM', 'INAPPROPRIATE_CONTENT', 'SAFETY_CONCERN', 'TECHNICAL_ISSUE', 'OTHER']),
    targetType: z.enum(['DONATION', 'USER', 'NGO', 'MESSAGE']),
    targetId: z.string().uuid('Invalid target ID'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
    evidence: z.array(z.string().url()).default([]),
  }),
});

export const updateReportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid report ID'),
  }),
  body: z.object({
    status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED', 'ESCALATED']),
    resolution: z.string().max(5000).optional(),
  }),
});

export const listReportsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    status: z.string().optional(),
    type: z.string().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});
