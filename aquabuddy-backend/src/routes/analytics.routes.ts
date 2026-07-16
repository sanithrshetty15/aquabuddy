import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// GET /analytics/overview - Fetch high level metrics
router.get('/overview', authenticate, analyticsController.getOverview);

// GET /analytics/:robotId/dashboard - Fetch data points for charts
router.get('/:robotId/dashboard', authenticate, analyticsController.getDashboardCharts);

export default router;
