import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as alertController from '../controllers/alerts.controller';

const router = Router();

// GET /alerts - List alerts
router.get('/', authenticate, alertController.getAlerts);

// PATCH /alerts/:id/acknowledge - Acknowledge alert
router.patch('/:id/acknowledge', authenticate, alertController.acknowledgeAlert);

// PATCH /alerts/:id/resolve - Resolve alert
router.patch('/:id/resolve', authenticate, alertController.resolveAlert);

export default router;
