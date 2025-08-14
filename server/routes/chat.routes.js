import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getVerifiedUsers, getConversations, getOrCreateConversation, getMessages, createMessage, markConversationRead, deleteMessage } from '../controllers/chat.controller.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/users/verified', getVerifiedUsers);
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.post('/conversations/read', markConversationRead);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', createMessage);
router.delete('/messages/:messageId', deleteMessage);

export default router;


