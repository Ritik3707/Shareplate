import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { FilterOptions } from '../types';
import { getPaginationParams, getSortParams } from '../utils/helpers';
import type { Prisma, Chat, Message } from '@prisma/client';

export class ChatRepository {
  async findById(id: string): Promise<Chat | null> {
    return prisma.chat.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, avatar: true },
            },
          },
        },
      },
    });
  }

  async create(data: Prisma.ChatCreateInput): Promise<Chat> {
    const chat = await prisma.chat.create({ data });
    logger.info(`Chat created: ${chat.id}`);
    return chat;
  }

  async addParticipant(chatId: string, userId: string): Promise<void> {
    await prisma.chatParticipant.create({
      data: {
        chatId,
        userId,
      },
    });
  }

  async createMessage(data: Prisma.MessageCreateInput): Promise<Message> {
    return prisma.message.create({ data });
  }

  async getMessages(chatId: string, options: FilterOptions): Promise<{ messages: Message[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { chatId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      }),
      prisma.message.count({ where: { chatId } }),
    ]);

    return { messages: messages.reverse(), total };
  }

  async listByUser(userId: string, options: FilterOptions): Promise<{ chats: Chat[]; total: number }> {
    const { page, limit, skip } = getPaginationParams(options);

    const [chats, total] = await Promise.all([
      prisma.chat.findMany({
        where: {
          participants: {
            some: { userId },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, avatar: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: { id: true, firstName: true, lastName: true },
              },
            },
          },
        },
      }),
      prisma.chat.count({
        where: {
          participants: {
            some: { userId },
          },
        },
      }),
    ]);

    return { chats, total };
  }

  async markAsRead(chatId: string, userId: string): Promise<void> {
    await prisma.chatParticipant.updateMany({
      where: { chatId, userId },
      data: { lastReadAt: new Date() },
    });
  }

  async isParticipant(chatId: string, userId: string): Promise<boolean> {
    const count = await prisma.chatParticipant.count({
      where: { chatId, userId },
    });
    return count > 0;
  }
}

export const chatRepository = new ChatRepository();
