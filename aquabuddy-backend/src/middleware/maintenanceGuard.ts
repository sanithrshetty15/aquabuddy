import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { heartbeatService } from '../robot/communication/health/heartbeat.service';

export async function maintenanceGuard(req: Request, res: Response, next: NextFunction): Promise<void> {
  const robotId = req.params.id || req.body?.robotId;
  if (!robotId) {
    next();
    return;
  }

  try {
    const robot = await prisma.robot.findUnique({
      where: { id: robotId },
      select: { id: true, status: true },
    });

    if (!robot) {
      res.status(404).json({ success: false, message: 'Robot not found' });
      return;
    }

    if (robot.status === 'MAINTENANCE' || robot.status === 'SERVICE') {
      res.status(423).json({
        success: false,
        statusCode: 423,
        message: `Robot is in ${robot.status} mode. This operation is not allowed.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (robot.status === 'RETIRED') {
      res.status(410).json({
        success: false,
        statusCode: 410,
        message: 'Robot has been retired. No operations allowed.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (robot.status === 'FIRMWARE_UPDATE') {
      res.status(423).json({
        success: false,
        statusCode: 423,
        message: 'Robot is performing a firmware update. Commands are blocked.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (robot.status === 'MANUFACTURED' || robot.status === 'TESTING' || robot.status === 'READY') {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Robot is in pre-activation state: ${robot.status}. Activate the robot first.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}

export function offlineAware(req: Request, res: Response, next: NextFunction): void {
  const robotId = req.params.id;
  if (!robotId) {
    next();
    return;
  }

  const status = heartbeatService.getStatus(robotId);
  if (status !== 'UNKNOWN') {
    res.locals.robotConnectionState = status;
  }

  next();
}
