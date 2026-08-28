import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplace.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/cores', MarketplaceController.listCores);
router.get('/businesses', optionalAuthenticate, MarketplaceController.listBusinesses);
router.post('/businesses', authenticate, MarketplaceController.registerBusiness);

export default router;
