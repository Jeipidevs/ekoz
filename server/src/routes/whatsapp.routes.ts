import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/send-push', authenticate, WhatsAppController.sendPush);
router.post('/test', WhatsAppController.testDispatch);

export default router;
