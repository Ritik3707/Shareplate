import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validateParams, validateQuery, validateBody } from '../middleware/validator';
import { reportIdSchema, createReportSchema, updateReportSchema, listReportsSchema } from '../validators/report.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, buildPaginationMeta, createdResponse } from '../utils/response';
import { reportRepository } from '../repositories/report.repository';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', requireAdmin, validateQuery(listReportsSchema), asyncHandler(async (req, res) => {
  const result = await reportRepository.list(req.query);
  successResponse(res, result.reports, 'Reports retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/:id', requireAdmin, validateParams(reportIdSchema), asyncHandler(async (req, res) => {
  const report = await reportRepository.findById(req.params.id);
  if (!report) throw new NotFoundError('Report not found');
  successResponse(res, report, 'Report retrieved');
}));

router.post('/', validateBody(createReportSchema), asyncHandler(async (req, res) => {
  const report = await reportRepository.create({ ...req.body, reporterId: req.user!.id, status: 'OPEN' });
  createdResponse(res, report, 'Report submitted');
}));

router.patch('/:id', requireAdmin, validateParams(reportIdSchema), validateBody(updateReportSchema), asyncHandler(async (req, res) => {
  const report = await reportRepository.update(req.params.id, { status: req.body.status, resolution: req.body.resolution });
  successResponse(res, report, 'Report updated');
}));

router.post('/:id/resolve', requireAdmin, validateParams(reportIdSchema), asyncHandler(async (req, res) => {
  const report = await reportRepository.resolve(req.params.id, req.user!.id, req.body.resolution);
  successResponse(res, report, 'Report resolved');
}));

export default router;
