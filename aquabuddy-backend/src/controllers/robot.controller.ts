import { Request, Response, NextFunction } from 'express';
import * as robotService from '../services/robot.service';
import * as lifecycleServiceModule from '../services/lifecycle.service';
import { healthScoreService } from '../services/healthScore.service';
import { digitalTwinService } from '../services/digitalTwin.service';
import { robotCommandService } from '../robot/communication/commands/command.service';
import { heartbeatService } from '../robot/communication/health/heartbeat.service';

export const listRobots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
    } = req.query as Record<string, string>;

    const result = await robotService.getRobots({
      userId: (req as any).user?.userId,
      isAdmin: ['ADMIN', 'OWNER'].includes((req as any).user?.role),
      search,
      status,
      pagination: { page: parseInt(page), limit: parseInt(limit), sortBy, sortOrder },
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const robotDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robot = await robotService.getRobotById(
      req.params.id,
      (req as any).user?.userId,
      ['ADMIN', 'OWNER'].includes((req as any).user?.role)
    );
    res.json({ success: true, data: robot });
  } catch (err) {
    next(err);
  }
};

export const addRobot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robot = await robotService.createRobot(req.body);
    res.status(201).json({ success: true, message: 'Robot registered successfully', data: robot });
  } catch (err) {
    next(err);
  }
};

export const changeRobotStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const robot = await robotService.updateRobotStatus(req.params.id, status, {
      triggeredBy: (req as any).user?.userId,
      reason: `Status change requested by ${(req as any).user?.userId}`,
    });
    res.json({ success: true, message: 'Robot status updated', data: robot });
  } catch (err) {
    next(err);
  }
};

export const linkRobot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, name } = req.body;
    const robot = await robotService.linkRobotToOwner((req as any).user.userId, code, name);
    res.status(200).json({ success: true, message: 'Robot linked successfully', data: robot });
  } catch (err) {
    next(err);
  }
};

export const sendRobotCommand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { command, payload } = req.body;
    const { id: robotId } = req.params;
    const userId = (req as any).user?.userId;

    const { allowed, reason } = await lifecycleServiceModule.lifecycleService.canSendCommand(robotId);
    if (!allowed) {
      res.status(423).json({ success: false, message: reason });
      return;
    }

    const io = req.app.get('io');
    const executionResult = await robotCommandService.executeCommand({
      command,
      robotId,
      userId,
      params: payload ? JSON.parse(payload) : undefined,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      io,
    });

    res.status(200).json({
      success: true,
      message: `Command '${command}' sent to robot`,
      data: executionResult,
    });
  } catch (err) {
    next(err);
  }
};

export const getLifecycleHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const history = await lifecycleServiceModule.lifecycleService.getLifecycleHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

export const getHealthScore = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const score = await healthScoreService.calculate(req.params.id);
    res.json({ success: true, data: score });
  } catch (err) {
    next(err);
  }
};

export const getDigitalTwin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const twin = await digitalTwinService.getTwin(req.params.id);
    res.json({ success: true, data: twin });
  } catch (err) {
    next(err);
  }
};

export const retireRobot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const robot = await robotService.retireRobot(req.params.id, (req as any).user?.userId, reason);
    res.json({ success: true, message: 'Robot retired', data: robot });
  } catch (err) {
    next(err);
  }
};

export const activateRobot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robot = await robotService.updateRobotStatus(req.params.id, 'ACTIVATED' as any, {
      triggeredBy: (req as any).user?.userId,
      reason: 'Manual activation',
    });
    res.json({ success: true, message: 'Robot activated', data: robot });
  } catch (err) {
    next(err);
  }
};

export const markOnline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robot = await robotService.markOnline(req.params.id, (req as any).user?.userId);
    res.json({ success: true, message: 'Robot marked online', data: robot });
  } catch (err) {
    next(err);
  }
};

export const markOffline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robot = await robotService.markOffline(req.params.id, (req as any).user?.userId);
    res.json({ success: true, message: 'Robot marked offline', data: robot });
  } catch (err) {
    next(err);
  }
};

export const getRobotStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robot = await robotService.getRobotById(
      req.params.id,
      (req as any).user?.userId,
      ['ADMIN', 'OWNER'].includes((req as any).user?.role)
    );
    const connectionState = heartbeatService.getStatus(req.params.id);
    res.json({
      success: true,
      data: {
        ...robot,
        connectionState,
        isOnline: connectionState === 'ONLINE',
      },
    });
  } catch (err) {
    next(err);
  }
};
