import { z } from 'zod';

export const createVolunteerProfileSchema = z.object({
  body: z.object({
    vehicleType: z.enum(['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN', 'TRUCK']).optional(),
    vehicleNumber: z.string().max(50).optional(),
    licenseNumber: z.string().max(100).optional(),
    maxDistance: z.number().int().positive().default(10),
    preferredTimeStart: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
    preferredTimeEnd: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
    preferredDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])).default([]),
  }),
});

export const updateVolunteerProfileSchema = z.object({
  body: z.object({
    vehicleType: z.enum(['BICYCLE', 'MOTORCYCLE', 'CAR', 'VAN', 'TRUCK']).optional(),
    vehicleNumber: z.string().max(50).optional(),
    licenseNumber: z.string().max(100).optional(),
    available: z.boolean().optional(),
    maxDistance: z.number().int().positive().optional(),
    preferredTimeStart: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
    preferredTimeEnd: z.string().regex(/^([01]?\d|2[0-3]):[0-5]\d$/).optional(),
    preferredDays: z.array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])).optional(),
  }),
});

export const updateLocationSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

export const listVolunteersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    available: z.string().transform((v) => v === 'true').optional(),
    lat: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).optional(),
    lng: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).optional(),
    radius: z.string().regex(/^\d+$/).transform(Number).default('10'),
    sortBy: z.string().default('rating'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const volunteerIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid volunteer ID'),
  }),
});
