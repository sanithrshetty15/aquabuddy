import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as revenueController from '../controllers/revenue.controller';

const router = Router();

router.get('/', authenticate, requireRole('ADMIN', 'OWNER'), revenueController.listRevenue);
router.get('/summary', authenticate, requireRole('ADMIN', 'OWNER'), revenueController.getSummary);
router.post('/', authenticate, requireRole('OWNER'), revenueController.createRevenue);

export default router;
