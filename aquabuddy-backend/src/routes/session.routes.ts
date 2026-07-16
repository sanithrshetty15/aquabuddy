import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as sessionController from '../controllers/session.controller';

const router = Router();

router.get('/me', authenticate, sessionController.getMySessions);
router.delete('/me', authenticate, sessionController.revokeAllMySessions);
router.delete('/me/:id', authenticate, sessionController.revokeMySession);
router.get('/', authenticate, requireRole('ADMIN', 'OWNER'), sessionController.listAllSessions);
router.delete('/:id', authenticate, requireRole('ADMIN', 'OWNER'), sessionController.revokeSessionAdmin);

export default router;
