import { Request, Response, NextFunction } from 'express';
import * as mapService from '../services/map.service';

export const getRobotLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const locations = await mapService.getRobotLocations(user.id, user.role);
    res.json({ success: true, data: locations });
  } catch (error) { next(error); }
};
