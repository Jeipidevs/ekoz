import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, NotificationsController.listNotifications);
router.patch('/:id/read', authenticate, NotificationsController.markRead);
router.patch('/read-all', authenticate, NotificationsController.markAllRead);

export default router;
