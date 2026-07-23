import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateParams, validateQuery, validateBody } from '../middleware/validator';
import { paymentIdSchema, createPaymentSchema, listPaymentsSchema } from '../validators/payment.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, buildPaginationMeta, createdResponse } from '../utils/response';
import { paymentRepository } from '../repositories/payment.repository';
import { stripe } from '../config/stripe';
import { NotFoundError } from '../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', validateQuery(listPaymentsSchema), asyncHandler(async (req, res) => {
  const result = await paymentRepository.list(req.query);
  successResponse(res, result.payments, 'Payments retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/my-payments', asyncHandler(async (req, res) => {
  const result = await paymentRepository.findByUser(req.user!.id, req.query);
  successResponse(res, result.payments, 'My payments retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.get('/:id', validateParams(paymentIdSchema), asyncHandler(async (req, res) => {
  const payment = await paymentRepository.findById(req.params.id);
  if (!payment) throw new NotFoundError('Payment not found');
  successResponse(res, payment, 'Payment retrieved');
}));

router.post('/', validateBody(createPaymentSchema), asyncHandler(async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(req.body.amount * 100),
    currency: req.body.currency || 'usd',
    metadata: { userId: req.user!.id, ngoId: req.body.ngoId },
  });

  const payment = await paymentRepository.create({
    userId: req.user!.id,
    stripePaymentIntentId: paymentIntent.id,
    amount: req.body.amount,
    currency: req.body.currency || 'USD',
    status: 'PENDING',
    ngoId: req.body.ngoId,
    description: req.body.description,
  });

  createdResponse(res, { payment, clientSecret: paymentIntent.client_secret }, 'Payment initiated');
}));

export default router;
