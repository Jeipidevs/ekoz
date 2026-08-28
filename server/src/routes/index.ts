import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import postsRoutes from './posts.routes.js';
import academyRoutes from './academy.routes.js';
import marketplaceRoutes from './marketplace.routes.js';
import eventsRoutes from './events.routes.js';
import experiencesRoutes from './experiences.routes.js';
import chatRoutes from './chat.routes.js';
import notificationsRoutes from './notifications.routes.js';
import caktoRoutes from './cakto.routes.js';
import whatsappRoutes from './whatsapp.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/posts', postsRoutes);
apiRouter.use('/academy', academyRoutes);
apiRouter.use('/marketplace', marketplaceRoutes);
apiRouter.use('/events', eventsRoutes);
apiRouter.use('/experiences', experiencesRoutes);
apiRouter.use('/chat', chatRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/cakto', caktoRoutes);
apiRouter.use('/whatsapp', whatsappRoutes);

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    ecosystem: 'Ekoz',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
