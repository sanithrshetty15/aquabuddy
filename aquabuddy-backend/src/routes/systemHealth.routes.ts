import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as systemHealthController from '../controllers/systemHealth.controller';

const router = Router();

router.get('/', systemHealthController.getHealth);
router.get('/components', authenticate, requireRole('ADMIN', 'OWNER'), systemHealthController.getAllComponents);
router.get('/components/:component', authenticate, requireRole('ADMIN', 'OWNER'), systemHealthController.getComponentHealth);

export default router;
