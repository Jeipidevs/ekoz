import { Router } from 'express';
import { VideoCallController } from '../controllers/videocall.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/token', authenticate, VideoCallController.getToken);

export default router;
