import { Router } from 'express';
import { EventsController } from '../controllers/events.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, EventsController.listEvents);
router.post('/:id/rsvp', authenticate, EventsController.toggleRegistration);

export default router;
