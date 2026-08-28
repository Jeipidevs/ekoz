import { Router } from 'express';
import { AcademyController } from '../controllers/academy.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/courses', optionalAuthenticate, AcademyController.listCourses);
router.post('/lessons/:lessonId/progress', authenticate, AcademyController.toggleLessonProgress);
router.get('/lessons/:lessonId/comments', optionalAuthenticate, AcademyController.getLessonComments);
router.post('/lessons/:lessonId/comments', authenticate, AcademyController.addLessonComment);

export default router;
