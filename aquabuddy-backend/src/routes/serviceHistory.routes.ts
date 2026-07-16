import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as serviceHistoryController from '../controllers/serviceHistory.controller';

const router = Router();

router.get('/robot/:robotId', authenticate, serviceHistoryController.getHistory);
router.post('/', authenticate, requireRole('ADMIN', 'OWNER'), serviceHistoryController.createRecord);
router.patch('/:id', authenticate, requireRole('ADMIN', 'OWNER'), serviceHistoryController.updateRecord);
router.delete('/:id', authenticate, requireRole('ADMIN', 'OWNER'), serviceHistoryController.deleteRecord);
router.get('/upcoming', authenticate, requireRole('ADMIN', 'OWNER'), serviceHistoryController.getUpcoming);

export default router;
