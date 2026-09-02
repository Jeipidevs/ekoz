import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Cadastro público fechado: contas só são criadas pelo webhook da Cakto
// (compra aprovada) — ver server/src/services/cakto.service.ts
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.put('/profile', authenticate, AuthController.updateProfile);

export default router;
