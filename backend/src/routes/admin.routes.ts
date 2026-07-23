import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { prisma } from '../config/database';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/dashboard', asyncHandler(async (req, res) => {
  const [totalUsers, totalDonations, totalNgos, totalVolunteers, pendingVerifications, recentDonations] = await Promise.all([
    prisma.user.count(),
    prisma.donation.count(),
    prisma.ngoProfile.count(),
    prisma.volunteerProfile.count(),
    prisma.ngoProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.donation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        donor: { select: { firstName: true, lastName: true } },
        ngo: { select: { organizationName: true } },
      },
    }),
  ]);

  successResponse(res, {
    stats: { totalUsers, totalDonations, totalNgos, totalVolunteers, pendingVerifications },
    recentDonations,
  }, 'Dashboard data retrieved');
}));

router.get('/analytics', asyncHandler(async (req, res) => {
  const donationsByStatus = await prisma.donation.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const donationsByMonth = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
    FROM donations
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month DESC
    LIMIT 12
  `;

  successResponse(res, { donationsByStatus, donationsByMonth }, 'Analytics retrieved');
}));

export default router;
