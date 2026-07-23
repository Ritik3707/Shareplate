import { Router } from 'express';
import { authenticate, requireVolunteer } from '../middleware/auth';
import { validateParams, validateQuery, validateBody } from '../middleware/validator';
import { volunteerIdSchema, listVolunteersSchema, createVolunteerProfileSchema, updateVolunteerProfileSchema, updateLocationSchema } from '../validators/volunteer.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, buildPaginationMeta, createdResponse } from '../utils/response';
import { volunteerRepository } from '../repositories/volunteer.repository';
import { NotFoundError } from '../utils/errors';

const router = Router();

router.get('/', validateQuery(listVolunteersSchema), asyncHandler(async (req, res) => {
  const result = await volunteerRepository.list(req.query);
  successResponse(res, result.volunteers, 'Volunteers retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/nearby', asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query;
  const result = await volunteerRepository.findNearby(
    parseFloat(lat as string),
    parseFloat(lng as string),
    parseInt(radius as string) || 10,
    req.query
  );
  successResponse(res, result.volunteers, 'Nearby volunteers retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/:id', validateParams(volunteerIdSchema), asyncHandler(async (req, res) => {
  const volunteer = await volunteerRepository.findById(req.params.id);
  if (!volunteer) throw new NotFoundError('Volunteer not found');
  successResponse(res, volunteer, 'Volunteer retrieved');
}));

router.post('/', authenticate, validateBody(createVolunteerProfileSchema), asyncHandler(async (req, res) => {
  const volunteer = await volunteerRepository.create({ ...req.body, userId: req.user!.id });
  createdResponse(res, volunteer, 'Volunteer profile created');
}));

router.patch('/:id', authenticate, requireVolunteer, validateParams(volunteerIdSchema), validateBody(updateVolunteerProfileSchema), asyncHandler(async (req, res) => {
  const volunteer = await volunteerRepository.update(req.params.id, req.body);
  successResponse(res, volunteer, 'Volunteer profile updated');
}));

router.post('/location', authenticate, requireVolunteer, validateBody(updateLocationSchema), asyncHandler(async (req, res) => {
  const volunteer = await volunteerRepository.updateLocation(req.user!.id, req.body.latitude, req.body.longitude);
  successResponse(res, volunteer, 'Location updated');
}));

export default router;
