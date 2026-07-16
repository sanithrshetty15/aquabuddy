import { Request, Response, NextFunction } from 'express';
import * as predictionService from '../services/prediction.service';

/**
 * GET /predictions/:robotId
 * Fetch forecast predictions for a robot
 */
export const getPredictions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robotId = req.params.robotId as string;
    const predictions = await predictionService.getPredictions(robotId);
    res.json({ success: true, data: predictions });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /predictions/:robotId/generate
 * Re-run predictions calculation for a robot
 */
export const triggerPredictionsGeneration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robotId = req.params.robotId as string;
    const predictions = await predictionService.generateRobotPredictions(robotId);
    res.json({ success: true, message: 'Predictions generated', data: predictions });
  } catch (error) {
    next(error);
  }
};
