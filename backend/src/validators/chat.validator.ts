import { z } from 'zod';

export const createChatSchema = z.object({
  body: z.object({
    participantIds: z.array(z.string().uuid()).min(1, 'At least one participant required'),
    title: z.string().max(200).optional(),
    donationId: z.string().uuid().optional(),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    chatId: z.string().uuid('Invalid chat ID'),
  }),
  body: z.object({
    content: z.string().min(1, 'Message content is required').max(5000),
    type: z.enum(['TEXT', 'IMAGE', 'FILE', 'LOCATION', 'SYSTEM']).default('TEXT'),
    fileUrl: z.string().url().optional(),
    fileName: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

export const chatIdSchema = z.object({
  params: z.object({
    chatId: z.string().uuid('Invalid chat ID'),
  }),
});

export const listChatsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  }),
});
