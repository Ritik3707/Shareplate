import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validateParams, validateQuery, validateBody } from '../middleware/validator';
import { chatIdSchema, createChatSchema, sendMessageSchema, listChatsSchema } from '../validators/chat.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse, buildPaginationMeta, createdResponse } from '../utils/response';
import { chatRepository } from '../repositories/chat.repository';
import { NotFoundError, ForbiddenError } from '../utils/errors';

const router = Router();
router.use(authenticate);

router.get('/', validateQuery(listChatsSchema), asyncHandler(async (req, res) => {
  const result = await chatRepository.listByUser(req.user!.id, req.query);
  successResponse(res, result.chats, 'Chats retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.post('/', validateBody(createChatSchema), asyncHandler(async (req, res) => {
  const chat = await chatRepository.create({
    title: req.body.title,
    donationId: req.body.donationId,
    participants: { create: req.body.participantIds.map((id: string) => ({ userId: id })) },
  });
  createdResponse(res, chat, 'Chat created');
}));

router.get('/:chatId', validateParams(chatIdSchema), asyncHandler(async (req, res) => {
  const chat = await chatRepository.findById(req.params.chatId);
  if (!chat) throw new NotFoundError('Chat not found');
  const isParticipant = await chatRepository.isParticipant(req.params.chatId, req.user!.id);
  if (!isParticipant) throw new ForbiddenError('Not a participant in this chat');
  successResponse(res, chat, 'Chat retrieved');
}));

router.get('/:chatId/messages', validateParams(chatIdSchema), asyncHandler(async (req, res) => {
  const result = await chatRepository.getMessages(req.params.chatId, req.query);
  successResponse(res, result.messages, 'Messages retrieved', 200, buildPaginationMeta(
    parseInt(req.query.page as string) || 1,
    parseInt(req.query.limit as string) || 20,
    result.total
  ));
}));

router.post('/:chatId/messages', validateParams(chatIdSchema), validateBody(sendMessageSchema), asyncHandler(async (req, res) => {
  const message = await chatRepository.createMessage({
    chatId: req.params.chatId,
    senderId: req.user!.id,
    content: req.body.content,
    type: req.body.type,
    fileUrl: req.body.fileUrl,
    fileName: req.body.fileName,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
  });
  createdResponse(res, message, 'Message sent');
}));

router.post('/:chatId/read', validateParams(chatIdSchema), asyncHandler(async (req, res) => {
  await chatRepository.markAsRead(req.params.chatId, req.user!.id);
  successResponse(res, null, 'Marked as read');
}));

export default router;
