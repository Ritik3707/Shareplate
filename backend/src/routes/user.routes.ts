import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateParams, validateQuery, validateBody } from '../middleware/validator';
import { userIdSchema, listUsersSchema, updateUserSchema, updateUserStatusSchema } from '../validators/user.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, buildPaginationMeta } from '../utils/response';
import { userRepository } from '../repositories/user.repository';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', requireAdmin, validateQuery(listUsersSchema), asyncHandler(async (req, res) => {
  const result = await userRepository.list(req.query);
  successResponse(res, result.users, 'Users retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/:id', validateParams(userIdSchema), asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  successResponse(res, user, 'User retrieved');
}));

router.patch('/:id', requireAdmin, validateParams(userIdSchema), validateBody(updateUserSchema), asyncHandler(async (req, res) => {
  const user = await userRepository.update(req.params.id, req.body);
  successResponse(res, user, 'User updated');
}));

router.patch('/:id/status', requireAdmin, validateParams(userIdSchema), validateBody(updateUserStatusSchema), asyncHandler(async (req, res) => {
  const user = await userRepository.update(req.params.id, { status: req.body.status });
  successResponse(res, user, 'User status updated');
}));

export default router;
