import { z } from 'zod';

export const createPickupSchema = z.object({
  body: z.object({
    donationId: z.string().uuid('Invalid donation ID'),
    notes: z.string().max(1000).optional(),
  }),
});

export const updatePickupSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PICKED_UP', 'IN_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED']),
    notes: z.string().max(1000).optional(),
  }),
});

export const pickupIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid pickup ID'),
  }),
});

export const listPickupsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    status: z.string().optional(),
    donationId: z.string().uuid().optional(),
    volunteerId: z.string().uuid().optional(),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const verifyPickupSchema = z.object({
  body: z.object({
    qrCode: z.string().min(1, 'QR code is required'),
    photoUrl: z.string().url().optional(),
    signature: z.string().optional(),
  }),
});
