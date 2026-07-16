import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.get('/stats', authenticate, requireRole('ADMIN'), adminController.getLiveOpsStats);
router.get('/users', authenticate, requireRole('ADMIN'), adminController.listUsers);
router.delete('/users/:id', authenticate, requireRole('ADMIN'), adminController.deleteUser);

export default router;
