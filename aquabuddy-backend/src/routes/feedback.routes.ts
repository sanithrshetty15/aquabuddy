import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { feedbackRateLimiter } from '../middleware/rateLimiter';
import * as feedbackController from '../controllers/feedback.controller';

const router = Router();

router.post('/', authenticate, feedbackRateLimiter, feedbackController.submitFeedback);
router.get('/me', authenticate, feedbackController.getMyFeedback);
router.get('/', authenticate, requireRole('ADMIN'), feedbackController.getAllFeedback);
router.patch('/:id/respond', authenticate, requireRole('ADMIN'), feedbackController.respondToFeedback);

export default router;
