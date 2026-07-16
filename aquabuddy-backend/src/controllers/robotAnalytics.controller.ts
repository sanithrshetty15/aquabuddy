import { Request, Response, NextFunction } from 'express';
import * as robotAnalyticsService from '../services/robotAnalytics.service';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const analytics = await robotAnalyticsService.getRobotAnalytics(req.params.robotId as string, Math.min(days, 90));
    res.json(StandardApiResponseDto.ok(analytics));
  } catch (error) {
    next(error);
  }
};

export const getLatestAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await robotAnalyticsService.getLatestRobotAnalytics(req.params.robotId as string);
    res.json(StandardApiResponseDto.ok(analytics));
  } catch (error) {
    next(error);
  }
};
