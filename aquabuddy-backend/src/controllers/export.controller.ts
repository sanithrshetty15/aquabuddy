import { Request, Response, NextFunction } from 'express';
import * as exportService from '../services/export.service';

export const exportRobotsCSV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'ADMIN' || (req as any).user?.role === 'OWNER';
    const where = isAdmin ? {} : { ownerId: userId };

    const csv = await exportService.exportRobotsCSV(where);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="robots.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportRobotsJSON = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'ADMIN' || (req as any).user?.role === 'OWNER';
    const where = isAdmin ? {} : { ownerId: userId };

    const data = await exportService.exportRobotsJSON(where);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="robots.json"');
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const exportAlertsCSV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const csv = await exportService.exportAlertsCSV({});
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="alerts.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportSensorCSV = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const csv = await exportService.exportSensorCSV(req.params.robotId as string);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sensor-${req.params.robotId}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
