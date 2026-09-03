import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { STAFF_ROLES } from '../utils/roles.js';

const router = Router();

router.use(authenticate, requireRole(STAFF_ROLES));

router.get('/users', AdminController.listUsers);
router.patch('/users/:userId/role', AdminController.updateRole);
router.patch('/users/:userId/active', AdminController.updateActive);

router.get('/subscriptions', AdminController.listSubscriptions);
router.patch('/subscriptions/:subscriptionId/revoke', AdminController.revokeSubscription);

export default router;
