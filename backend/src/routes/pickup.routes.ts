import { Router } from 'express';
import { authenticate, requireVolunteer, requireNgo } from '../middleware/auth';
import { validateParams, validateQuery, validateBody } from '../middleware/validator';
import { pickupIdSchema, createPickupSchema, updatePickupSchema, listPickupsSchema, verifyPickupSchema } from '../validators/pickup.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, buildPaginationMeta, createdResponse } from '../utils/response';
import { pickupRepository } from '../repositories/pickup.repository';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', validateQuery(listPickupsSchema), asyncHandler(async (req, res) => {
  const result = await pickupRepository.list(req.query);
  successResponse(res, result.pickups, 'Pickups retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/my-pickups', requireVolunteer, asyncHandler(async (req, res) => {
  const result = await pickupRepository.findByVolunteer(req.user!.id, req.query);
  successResponse(res, result.pickups, 'My pickups retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/:id', validateParams(pickupIdSchema), asyncHandler(async (req, res) => {
  const pickup = await pickupRepository.findById(req.params.id);
  if (!pickup) throw new NotFoundError('Pickup not found');
  successResponse(res, pickup, 'Pickup retrieved');
}));

router.post('/', requireNgo, validateBody(createPickupSchema), asyncHandler(async (req, res) => {
  const pickup = await pickupRepository.create({
    donationId: req.body.donationId,
    status: 'PENDING',
    donorNotes: req.body.notes,
  });
  createdResponse(res, pickup, 'Pickup request created');
}));

router.post('/:id/accept', requireVolunteer, validateParams(pickupIdSchema), asyncHandler(async (req, res) => {
  const pickup = await pickupRepository.acceptPickup(req.params.id, req.user!.id);
  successResponse(res, pickup, 'Pickup accepted');
}));

router.patch('/:id/status', validateParams(pickupIdSchema), validateBody(updatePickupSchema), asyncHandler(async (req, res) => {
  const pickup = await pickupRepository.updateStatus(req.params.id, req.body.status);
  successResponse(res, pickup, 'Pickup status updated');
}));

router.post('/:id/verify', validateParams(pickupIdSchema), validateBody(verifyPickupSchema), asyncHandler(async (req, res) => {
  const pickup = await pickupRepository.verifyPickup(req.params.id, {
    pickupVerified: true,
    photoUrl: req.body.photoUrl,
    signature: req.body.signature,
  });
  successResponse(res, pickup, 'Pickup verified');
}));

export default router;
