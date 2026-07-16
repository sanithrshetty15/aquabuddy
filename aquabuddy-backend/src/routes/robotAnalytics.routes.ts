import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as robotAnalyticsController from '../controllers/robotAnalytics.controller';

const router = Router();

router.get('/:robotId', authenticate, robotAnalyticsController.getAnalytics);
router.get('/:robotId/latest', authenticate, robotAnalyticsController.getLatestAnalytics);

export default router;
