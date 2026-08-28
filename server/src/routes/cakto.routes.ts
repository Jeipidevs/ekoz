import { Router } from 'express';
import { CaktoController } from '../controllers/cakto.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create-order', authenticate, CaktoController.createOrder);
router.post('/webhook', CaktoController.handleWebhook);

export default router;
