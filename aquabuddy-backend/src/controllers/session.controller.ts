import { Request, Response, NextFunction } from 'express';
import * as sessionService from '../services/session.service';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const getMySessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const sessions = await sessionService.getUserSessions(userId);
    res.json(StandardApiResponseDto.ok(sessions));
  } catch (error) {
    next(error);
  }
};

export const revokeMySession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    await sessionService.revokeSession(req.params.id as string, userId);
    res.json(StandardApiResponseDto.ok(null, 'Session revoked'));
  } catch (error) {
    next(error);
  }
};

export const revokeAllMySessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    await sessionService.revokeAllSessions(userId);
    res.json(StandardApiResponseDto.ok(null, 'All sessions revoked'));
  } catch (error) {
    next(error);
  }
};

export const listAllSessions = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sessions = await sessionService.getAllSessions();
    res.json(StandardApiResponseDto.ok(sessions));
  } catch (error) {
    next(error);
  }
};

export const revokeSessionAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sessionService.revokeSession(req.params.id as string, '', true);
    res.json(StandardApiResponseDto.ok(null, 'Session revoked'));
  } catch (error) {
    next(error);
  }
};
