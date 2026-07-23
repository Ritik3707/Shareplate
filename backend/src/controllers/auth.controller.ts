import type { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, createdResponse } from '../utils/response';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  createdResponse(res, result, result.message);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.verifyEmail(req.body.userId, req.body.code);
  successResponse(res, result, result.message);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password, req.ip);
  successResponse(res, result, 'Logged in successfully');
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshToken(req.body.refreshToken);
  successResponse(res, result, 'Token refreshed');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.logout(req.user!.id, req.body.refreshToken);
  successResponse(res, result, result.message);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  successResponse(res, result, result.message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body.userId, req.body.token, req.body.newPassword);
  successResponse(res, result, result.message);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  successResponse(res, result, result.message);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  successResponse(res, req.user, 'User retrieved successfully');
});
