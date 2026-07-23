import type { Request, Response } from 'express';
import { donationService } from '../services/donation.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, createdResponse, buildPaginationMeta } from '../utils/response';

export const createDonation = asyncHandler(async (req: Request, res: Response) => {
  const donation = await donationService.create(req.body, req.user!.id);
  createdResponse(res, donation, 'Donation created successfully');
});

export const getDonations = asyncHandler(async (req: Request, res: Response) => {
  const result = await donationService.list(req.query);
  successResponse(res, result.donations, 'Donations retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
});

export const getDonationById = asyncHandler(async (req: Request, res: Response) => {
  const donation = await donationService.getById(req.params.id);
  successResponse(res, donation, 'Donation retrieved');
});

export const getNearbyDonations = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radius } = req.query;
  const result = await donationService.findNearby(
    parseFloat(lat as string),
    parseFloat(lng as string),
    parseInt(radius as string) || 10,
    req.query
  );
  successResponse(res, result.donations, 'Nearby donations retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
});

export const acceptDonation = asyncHandler(async (req: Request, res: Response) => {
  const donation = await donationService.accept(req.params.id, req.user!.ngoProfile!.id, req.user!.id);
  successResponse(res, donation, 'Donation accepted successfully');
});

export const cancelDonation = asyncHandler(async (req: Request, res: Response) => {
  const donation = await donationService.cancel(req.params.id, req.user!.id, req.body.reason);
  successResponse(res, donation, 'Donation cancelled successfully');
});

export const updateDonation = asyncHandler(async (req: Request, res: Response) => {
  const donation = await donationService.update(req.params.id, req.body, req.user!.id);
  successResponse(res, donation, 'Donation updated successfully');
});

export const getMyDonations = asyncHandler(async (req: Request, res: Response) => {
  const result = await donationService.getByDonor(req.user!.id, req.query);
  successResponse(res, result.donations, 'My donations retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
});
