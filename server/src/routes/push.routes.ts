import { Router } from 'express';
import { PushController } from '../controllers/push.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Chave pública pode ser lida por qualquer sessão autenticada.
router.get('/vapid-public-key', authenticate, PushController.getVapidPublicKey);
router.post('/subscribe', authenticate, PushController.subscribe);
router.post('/unsubscribe', authenticate, PushController.unsubscribe);

export default router;
