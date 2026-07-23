import { Router } from 'express';
import {
  createDonation,
  getDonations,
  getDonationById,
  getNearbyDonations,
  acceptDonation,
  cancelDonation,
  updateDonation,
  getMyDonations,
} from '../controllers/donation.controller';
import { authenticate, requireDonor, requireNgo } from '../middleware/auth';
import { donationRateLimiter } from '../middleware/rateLimiter';
import { validateBody, validateParams, validateQuery } from '../middleware/validator';
import {
  createDonationSchema,
  updateDonationSchema,
  donationIdSchema,
  listDonationsSchema,
  acceptDonationSchema,
  cancelDonationSchema,
} from '../validators/donation.validator';

const router = Router();

/**
 * @swagger
 * /donations:
 *   get:
 *     summary: List all donations
 *     tags: [Donations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: lat
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         schema: { type: number }
 *       - in: query
 *         name: radius
 *         schema: { type: integer, default: 10 }
 */
router.get('/', validateQuery(listDonationsSchema), getDonations);

/**
 * @swagger
 * /donations/nearby:
 *   get:
 *     summary: Find nearby donations
 *     tags: [Donations]
 */
router.get('/nearby', getNearbyDonations);

/**
 * @swagger
 * /donations/my-donations:
 *   get:
 *     summary: Get current user's donations
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-donations', authenticate, requireDonor, getMyDonations);

/**
 * @swagger
 * /donations/{id}:
 *   get:
 *     summary: Get donation by ID
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 */
router.get('/:id', validateParams(donationIdSchema), getDonationById);

/**
 * @swagger
 * /donations:
 *   post:
 *     summary: Create a new donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  requireDonor,
  donationRateLimiter,
  validateBody(createDonationSchema),
  createDonation
);

/**
 * @swagger
 * /donations/{id}:
 *   patch:
 *     summary: Update donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  authenticate,
  requireDonor,
  validateParams(donationIdSchema),
  validateBody(updateDonationSchema),
  updateDonation
);

/**
 * @swagger
 * /donations/{id}/accept:
 *   post:
 *     summary: Accept a donation (NGO only)
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/accept',
  authenticate,
  requireNgo,
  validateParams(acceptDonationSchema),
  acceptDonation
);

/**
 * @swagger
 * /donations/{id}/cancel:
 *   post:
 *     summary: Cancel a donation
 *     tags: [Donations]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/cancel',
  authenticate,
  requireDonor,
  validateParams(cancelDonationSchema),
  cancelDonation
);

export default router;
