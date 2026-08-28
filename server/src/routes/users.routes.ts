import { Router } from 'express';
import { UsersController } from '../controllers/users.controller.js';
import { optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, UsersController.listMembers);
router.get('/:id', optionalAuthenticate, UsersController.getMemberById);

export default router;
