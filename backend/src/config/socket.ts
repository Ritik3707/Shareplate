import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import logger from './logger';
import prisma from './database';
import type { TokenPayload } from '../types';

let io: SocketServer;

export const initializeSocket = (server: HttpServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as TokenPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, firstName: true, lastName: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      logger.error('Socket auth error:', error);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`🔌 User connected: ${user.id} (${socket.id})`);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // Update volunteer online status
    if (user.role === 'VOLUNTEER') {
      prisma.volunteerProfile.update({
        where: { userId: user.id },
        data: { status: 'AVAILABLE' },
      }).catch((err) => logger.error('Volunteer status update error:', err));
    }

    // Handle location updates from volunteers
    socket.on('location:update', async (data: { lat: number; lng: number }) => {
      if (user.role === 'VOLUNTEER') {
        try {
          await prisma.volunteerProfile.update({
            where: { userId: user.id },
            data: {
              currentLat: data.lat,
              currentLng: data.lng,
              lastLocationAt: new Date(),
            },
          });

          // Broadcast to relevant donation rooms
          socket.to('role:NGO').emit('volunteer:location', {
            volunteerId: user.id,
            lat: data.lat,
            lng: data.lng,
          });
        } catch (error) {
          logger.error('Location update error:', error);
        }
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('typing:start', {
        userId: user.id,
        chatId: data.chatId,
      });
    });

    socket.on('typing:stop', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('typing:stop', {
        userId: user.id,
        chatId: data.chatId,
      });
    });

    // Handle joining chat rooms
    socket.on('chat:join', (data: { chatId: string }) => {
      socket.join(`chat:${data.chatId}`);
      logger.info(`User ${user.id} joined chat ${data.chatId}`);
    });

    socket.on('chat:leave', (data: { chatId: string }) => {
      socket.leave(`chat:${data.chatId}`);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`🔌 User disconnected: ${user.id} (${socket.id})`);

      if (user.role === 'VOLUNTEER') {
        await prisma.volunteerProfile.update({
          where: { userId: user.id },
          data: { status: 'OFFLINE' },
        }).catch((err) => logger.error('Volunteer offline error:', err));
      }
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: unknown): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToRole = (role: string, event: string, data: unknown): void => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

export const emitToChat = (chatId: string, event: string, data: unknown): void => {
  if (io) {
    io.to(`chat:${chatId}`).emit(event, data);
  }
};

export const broadcast = (event: string, data: unknown): void => {
  if (io) {
    io.emit(event, data);
  }
};
