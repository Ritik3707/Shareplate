import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateParams, validateQuery, validateBody } from '../middleware/validator';
import { notificationIdSchema, listNotificationsSchema, markReadSchema } from '../validators/notification.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, buildPaginationMeta } from '../utils/response';
import { notificationRepository } from '../repositories/notification.repository';

const router = Router();
router.use(authenticate);

router.get('/', validateQuery(listNotificationsSchema), asyncHandler(async (req, res) => {
  const result = await notificationRepository.listByUser(req.user!.id, req.query);
  successResponse(res, result.notifications, 'Notifications retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await notificationRepository.getUnreadCount(req.user!.id);
  successResponse(res, { count }, 'Unread count retrieved');
}));

router.post('/mark-read', validateBody(markReadSchema), asyncHandler(async (req, res) => {
  if (req.body.markAll) {
    await notificationRepository.markAllAsRead(req.user!.id);
  } else {
    await notificationRepository.markAsRead(req.user!.id, req.body.ids);
  }
  successResponse(res, null, 'Notifications marked as read');
}));

router.delete('/:id', validateParams(notificationIdSchema), asyncHandler(async (req, res) => {
  await notificationRepository.delete(req.params.id);
  successResponse(res, null, 'Notification deleted');
}));

export default router;
