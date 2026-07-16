import { Request, Response, NextFunction } from 'express';
import * as analyticsService from '../services/analytics.service';

/**
 * GET /analytics/overview
 * Get summary dashboard metrics (total water, total active robots, alerts count, etc.)
 */
export const getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const kpis = await analyticsService.getOverviewKPIs(user.userId, user.role);
    res.json({ success: true, data: kpis });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/:robotId/dashboard
 * Get historical readings and predictions for analytics graphs
 */
export const getDashboardCharts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robotId = req.params.robotId as string;
    const { days } = req.query;
    const data = await analyticsService.getDashboardAnalytics(
      robotId,
      days ? parseInt(days as string) : 7
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
