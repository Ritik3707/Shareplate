import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { prisma } from '../config/database';

const router = Router();
router.use(authenticate);

router.get('/impact', asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const [donations, pickups, donorProfile] = await Promise.all([
    prisma.donation.count({ where: { donorId: userId } }),
    prisma.pickupRequest.count({ where: { volunteerId: userId } }),
    prisma.donorProfile.findUnique({ where: { userId } }),
  ]);

  successResponse(res, {
    totalDonations: donations,
    totalPickups: pickups,
    totalFoodWeight: donorProfile?.totalFoodWeight || 0,
    totalPeopleFed: donorProfile?.totalPeopleFed || 0,
  }, 'Impact data retrieved');
}));

router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { period = 'MONTHLY' } = req.query;

  const leaderboard = await prisma.leaderboard.findMany({
    where: { period: period as string },
    orderBy: { totalScore: 'desc' },
    take: 50,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });

  successResponse(res, leaderboard, 'Leaderboard retrieved');
}));

export default router;
