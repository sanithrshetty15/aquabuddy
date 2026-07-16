import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as predictionController from '../controllers/prediction.controller';

const router = Router();

// GET /predictions/:robotId - Get predictions
router.get('/:robotId', authenticate, predictionController.getPredictions);

// POST /predictions/:robotId/generate - Manually trigger calculation
router.post('/:robotId/generate', authenticate, predictionController.triggerPredictionsGeneration);

export default router;
