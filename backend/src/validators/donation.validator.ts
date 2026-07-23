import { z } from 'zod';

export const createDonationSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().max(2000).optional(),
    foodType: z.enum(['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'HALAL', 'KOSHER', 'OTHER']),
    foodCategory: z.enum(['COOKED_MEAL', 'RAW_INGREDIENTS', 'BAKERY', 'DAIRY', 'FRUITS_VEGETABLES', 'PACKAGED_FOOD', 'BEVERAGES', 'FROZEN_FOOD', 'OTHER']),
    quantity: z.number().positive('Quantity must be positive'),
    quantityUnit: z.string().default('kg'),
    servings: z.number().int().positive().optional(),
    isVegetarian: z.boolean().default(false),
    isVegan: z.boolean().default(false),
    isGlutenFree: z.boolean().default(false),
    isHalal: z.boolean().default(false),
    isKosher: z.boolean().default(false),
    allergens: z.array(z.string()).default([]),
    preparedAt: z.string().datetime().optional(),
    expiryTime: z.string().datetime(),
    pickupStartTime: z.string().datetime(),
    pickupEndTime: z.string().datetime(),
    pickupAddress: z.string().min(1, 'Pickup address is required').max(500),
    pickupLatitude: z.number().min(-90).max(90),
    pickupLongitude: z.number().min(-180).max(180),
    pickupInstructions: z.string().max(1000).optional(),
    deliveryAddress: z.string().max(500).optional(),
    deliveryLatitude: z.number().min(-90).max(90).optional(),
    deliveryLongitude: z.number().min(-180).max(180).optional(),
  }),
});

export const updateDonationSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().max(2000).optional(),
    foodType: z.enum(['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'HALAL', 'KOSHER', 'OTHER']).optional(),
    foodCategory: z.enum(['COOKED_MEAL', 'RAW_INGREDIENTS', 'BAKERY', 'DAIRY', 'FRUITS_VEGETABLES', 'PACKAGED_FOOD', 'BEVERAGES', 'FROZEN_FOOD', 'OTHER']).optional(),
    quantity: z.number().positive().optional(),
    servings: z.number().int().positive().optional(),
    expiryTime: z.string().datetime().optional(),
    pickupStartTime: z.string().datetime().optional(),
    pickupEndTime: z.string().datetime().optional(),
    pickupAddress: z.string().max(500).optional(),
    pickupLatitude: z.number().min(-90).max(90).optional(),
    pickupLongitude: z.number().min(-180).max(180).optional(),
    pickupInstructions: z.string().max(1000).optional(),
    status: z.enum(['PENDING', 'AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'EXPIRED', 'CANCELLED', 'REJECTED']).optional(),
  }),
});

export const donationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid donation ID'),
  }),
});

export const listDonationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
    status: z.enum(['PENDING', 'AVAILABLE', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'EXPIRED', 'CANCELLED', 'REJECTED']).optional(),
    foodType: z.string().optional(),
    foodCategory: z.string().optional(),
    lat: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).optional(),
    lng: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).optional(),
    radius: z.string().regex(/^\d+$/).transform(Number).default('10'),
    sortBy: z.string().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

export const acceptDonationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid donation ID'),
  }),
});

export const cancelDonationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid donation ID'),
  }),
  body: z.object({
    reason: z.string().min(1, 'Cancellation reason is required').max(500),
  }).optional(),
});
