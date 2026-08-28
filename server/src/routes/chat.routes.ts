import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/conversations', authenticate, ChatController.listConversations);
router.get('/conversations/:partnerId/messages', authenticate, ChatController.getMessages);

export default router;
