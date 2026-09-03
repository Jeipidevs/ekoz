import { Router } from 'express';
import { PostsController } from '../controllers/posts.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, PostsController.listPosts);
router.post('/', authenticate, PostsController.createPost);
router.post('/:id/like', authenticate, PostsController.toggleLike);
router.post('/:id/comments', authenticate, PostsController.addComment);
router.patch('/:id/pin', authenticate, PostsController.togglePin);
router.delete('/:id', authenticate, PostsController.deletePost);

export default router;
