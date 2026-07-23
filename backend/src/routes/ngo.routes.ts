import { Router } from 'express';
import { authenticate, requireNgo, requireAdmin } from '../middleware/auth';
import { validateParams, validateQuery, validateBody } from '../middleware/validator';
import { ngoIdSchema, listNgosSchema, createNgoProfileSchema, updateNgoProfileSchema, verifyNgoSchema } from '../validators/ngo.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, buildPaginationMeta, createdResponse } from '../utils/response';
import { ngoRepository } from '../repositories/ngo.repository';
import { NotFoundError } from '../utils/errors';

const router = Router();

router.get('/', validateQuery(listNgosSchema), asyncHandler(async (req, res) => {
  const result = await ngoRepository.list(req.query);
  successResponse(res, result.ngos, 'NGOs retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/nearby', asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;
  const result = await ngoRepository.findNearby(
    parseFloat(lat as string),
    parseFloat(lng as string),
    parseInt(radius as string) || 10,
    req.query
  );
  successResponse(res, result.ngos, 'Nearby NGOs retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/:id', validateParams(ngoIdSchema), asyncHandler(async (req, res) => {
  const ngo = await ngoRepository.findById(req.params.id);
  if (!ngo) throw new NotFoundError('NGO not found');
  successResponse(res, ngo, 'NGO retrieved');
}));

router.post('/', authenticate, validateBody(createNgoProfileSchema), asyncHandler(async (req, res) => {
  const ngo = await ngoRepository.create({ ...req.body, userId: req.user!.id });
  createdResponse(res, ngo, 'NGO profile created');
}));

router.patch('/:id', authenticate, requireNgo, validateParams(ngoIdSchema), validateBody(updateNgoProfileSchema), asyncHandler(async (req, res) => {
  const ngo = await ngoRepository.update(req.params.id, req.body);
  successResponse(res, ngo, 'NGO profile updated');
}));

router.post('/:id/verify', authenticate, requireAdmin, validateParams(ngoIdSchema), validateBody(verifyNgoSchema), asyncHandler(async (req, res) => {
  const ngo = await ngoRepository.verify(req.params.id, req.body.status, req.user!.id);
  successResponse(res, ngo, 'NGO verification status updated');
}));

export default router;
