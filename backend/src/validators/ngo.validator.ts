import { z } from 'zod';

export const createNgoProfileSchema = z.object({
  body: z.object({
    organizationName: z.string().min(1, 'Organization name is required').max(200),
    registrationNumber: z.string().max(100).optional(),
    taxExemptionId: z.string().max(100).optional(),
    description: z.string().max(5000).optional(),
    mission: z.string().max(2000).optional(),
    website: z.string().url().max(255).optional(),
    foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
    maxDailyCapacity: z.number().int().positive().optional(),
    storageCapacity: z.number().positive().optional(),
    refrigeration: z.boolean().default(false),
    serviceRadius: z.number().int().positive().default(15),
    operatingHours: z.string().optional(),
    contactPerson: z.string().max(100).optional(),
    contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    contactEmail: z.string().email().optional(),
  }),
});

export const updateNgoProfileSchema = z.object({
  body: z.object({
    organizationName: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    mission: z.string().max(2000).optional(),
    website: z.string().url().max(255).optional(),
    maxDailyCapacity: z.number().int().positive().optional(),
    storageCapacity: z.number().positive().optional(),
    refrigeration: z.boolean().optional(),
    serviceRadius: z.number().int().positive().optional(),
    operatingHours: z.string().optional(),
    contactPerson: z.string().max(100).optional(),
    contactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    contactEmail: z.string().email().optional(),
  }),
});

export const verifyNgoSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid NGO ID'),
  }),
  body: z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    reason: z.string().max(1000).optional(),
  }),
});

export const listNgosSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'UNDER_REVIEW']).optional(),
    search: z.string().optional(),
    lat: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).optional(),
    lng: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).optional(),
    radius: z.string().regex(/^\d+$/).transform(Number).default('10'),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const ngoIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid NGO ID'),
  }),
});
