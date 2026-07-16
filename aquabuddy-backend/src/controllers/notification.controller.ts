import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import { toNotificationResponse } from '../dtos';
import { StandardApiResponseDto } from '../dtos/common/api-response.dto';

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const notifications = await notificationService.getUserNotifications(userId, limit);
    res.json(StandardApiResponseDto.ok(notifications.map(toNotificationResponse)));
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const count = await notificationService.countUnread(userId);
    res.json(StandardApiResponseDto.ok({ count }));
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id as string);
    res.json(StandardApiResponseDto.ok(toNotificationResponse(notification)));
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    await notificationService.markAllAsRead(userId);
    res.json(StandardApiResponseDto.ok(null, 'All notifications marked as read'));
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.createNotification(req.body);
    res.status(201).json(StandardApiResponseDto.created(toNotificationResponse(notification)));
  } catch (error) {
    next(error);
  }
};
