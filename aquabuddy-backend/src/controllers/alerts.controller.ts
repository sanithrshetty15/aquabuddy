import { Request, Response, NextFunction } from 'express';
import * as alertService from '../services/alert.service';
import { extractPagination } from '../utils/pagination.utils';

/**
 * GET /alerts
 * Fetch alerts list with pagination
 */
export const getAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { robotId, status, severity, search } = req.query;
    const pagination = extractPagination(req, 'createdAt', ['createdAt', 'severity', 'status']);

    const result = await alertService.getAlerts({
      robotId: robotId as string,
      status: status as string,
      severity: severity as string,
      search: search as string,
      pagination,
    });

    res.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /alerts/:id/acknowledge
 * Acknowledge an alert
 */
export const acknowledgeAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const alert = await alertService.acknowledgeAlert(id);
    res.json({ success: true, message: 'Alert acknowledged', data: alert });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /alerts/:id/resolve
 * Resolve an alert
 */
export const resolveAlert = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const alert = await alertService.resolveAlert(id);
    res.json({ success: true, message: 'Alert resolved', data: alert });
  } catch (error) {
    next(error);
  }
};
