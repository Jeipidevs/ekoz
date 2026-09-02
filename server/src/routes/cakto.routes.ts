import { Router } from 'express';
import { CaktoController } from '../controllers/cakto.controller.js';

const router = Router();

router.post('/webhook', CaktoController.handleWebhook);

export default router;
