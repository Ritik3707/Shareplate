import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { logger } from '../config/logger';
import { emailFrom, transporter } from '../config/email';
import { userRepository } from '../repositories/user.repository';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  generateRandomToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/helpers';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import { JWT_ACCESS_EXPIRY_MS, JWT_REFRESH_EXPIRY_MS, CACHE_KEYS } from '../constants';
import type { TokenPayload, RefreshTokenPayload } from '../types';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
  }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role as any,
        status: 'PENDING_VERIFICATION',
      },
    });

    if (data.role === 'DONOR') {
      await prisma.donorProfile.create({ data: { userId: user.id } });
    } else if (data.role === 'NGO') {
      await prisma.ngoProfile.create({
        data: { userId: user.id, organizationName: `${data.firstName}'s Organization`, verificationStatus: 'PENDING' },
      });
    } else if (data.role === 'VOLUNTEER') {
      await prisma.volunteerProfile.create({ data: { userId: user.id } });
    }

    const otp = generateOTP();
    await prisma.otpVerification.create({
      data: {
        userId: user.id,
        purpose: 'EMAIL_VERIFICATION',
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await transporter.sendMail({
      from: emailFrom,
      to: user.email,
      subject: 'Verify your SharePlate account',
      html: `<h1>Welcome to SharePlate!</h1><p>Your verification code is: <strong>${otp}</strong></p><p>Expires in 10 minutes.</p>`,
    });

    logger.info(`User registered: ${user.id}`);

    return {
      userId: user.id,
      email: user.email,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async verifyEmail(userId: string, code: string) {
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        userId,
        code,
        purpose: 'EMAIL_VERIFICATION',
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    await prisma.$transaction([
      prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isVerified: true, verifiedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true, status: 'ACTIVE' },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      throw new UnauthorizedError('Account has been suspended. Please contact support.');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenId: generateRandomToken(16),
    });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRY_MS),
        ipAddress,
      },
    });

    await userRepository.updateLastLogin(user.id);
    await redis.setex(CACHE_KEYS.USER(user.id), 3600, JSON.stringify(user));

    logger.info(`User logged in: ${user.id}`);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: JWT_ACCESS_EXPIRY_MS / 1000,
    };
  }

  async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);

    return {
      accessToken,
      expiresIn: JWT_ACCESS_EXPIRY_MS / 1000,
    };
  }

  async logout(userId: string, token?: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true, revokedAt: new Date() },
      });
    }

    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    await redis.del(CACHE_KEYS.USER(userId));
    logger.info(`User logged out: ${userId}`);

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent.' };
    }

    const resetToken = generateRandomToken();
    await redis.setex(`password_reset:${user.id}`, 3600, resetToken);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&userId=${user.id}`;

    await transporter.sendMail({
      from: emailFrom,
      to: email,
      subject: 'Reset your SharePlate password',
      html: `<h1>Password Reset</h1><p>Click <a href="${resetUrl}">here</a> to reset your password. Expires in 1 hour.</p>`,
    });

    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(userId: string, token: string, newPassword: string) {
    const storedToken = await redis.get(`password_reset:${userId}`);
    if (!storedToken || storedToken !== token) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await redis.del(`password_reset:${userId}`);
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user || !user.password) {
      throw new NotFoundError('User not found');
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Password changed successfully' };
  }
}

export const authService = new AuthService();
