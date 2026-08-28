import { Router } from 'express';
import { ExperiencesController } from '../controllers/experiences.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, ExperiencesController.listExperiences);
router.post('/:id/apply', authenticate, ExperiencesController.applyForExperience);

export default router;
