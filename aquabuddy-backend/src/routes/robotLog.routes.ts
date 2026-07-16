import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as robotLogController from '../controllers/robotLog.controller';

const router = Router();

router.get('/:robotId', authenticate, robotLogController.getLogs);
router.post('/', authenticate, robotLogController.createLog);

export default router;
