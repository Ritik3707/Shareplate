import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError, ValidationError } from '../utils/errors';
import { errorResponse } from '../utils/response';

/**
 * Global Error Handler Middleware
 * Catches all errors and formats response
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    requestId: req.requestId,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      return errorResponse(res, err.message, err.statusCode, err.errors);
    }
    return errorResponse(res, err.message, err.statusCode);
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      return errorResponse(res, 'A record with this value already exists', 409);
    }
    if (prismaError.code === 'P2025') {
      return errorResponse(res, 'Record not found', 404);
    }
    if (prismaError.code === 'P2003') {
      return errorResponse(res, 'Foreign key constraint failed', 400);
    }
    return errorResponse(res, 'Database error', 500);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 401);
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    if (err.message === 'File too large') {
      return errorResponse(res, 'File too large. Maximum size is 5MB', 400);
    }
    return errorResponse(res, 'File upload error', 400);
  }

  // Default 500 error
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  return errorResponse(res, message, 500);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response): Response => {
  return errorResponse(res, `Route ${req.method} ${req.path} not found`, 404);
};
