import { Request, Response, NextFunction } from 'express';
import * as feedbackService from '../services/feedback.service';
import { createAuditLog } from '../services/audit.service';
import { extractPagination } from '../utils/pagination.utils';

export const submitFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user.userId;
    const { subject, message, rating, category } = req.body;
    const feedback = await feedbackService.submitFeedback({
      userId,
      subject,
      message,
      rating: rating ? parseInt(rating) : undefined,
      category,
    });
    await createAuditLog(userId, 'USER_FEEDBACK_SUBMIT', req.ip, req.headers['user-agent'] as string, `User submitted feedback on ${subject}`);
    res.status(201).json({ success: true, message: 'Feedback submitted', data: feedback });
  } catch (error) { next(error); }
};

export const getMyFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user.userId;
    const pagination = extractPagination(req, 'createdAt', ['createdAt', 'status']);
    const result = await feedbackService.getUserFeedback({ userId, pagination });
    res.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) { next(error); }
};

export const getAllFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search } = req.query;
    const pagination = extractPagination(req, 'createdAt', ['createdAt', 'status', 'rating']);
    const result = await feedbackService.getAllFeedback({
      status: status as string,
      search: search as string,
      pagination,
    });
    res.json({ success: true, data: result.items, pagination: result.pagination });
  } catch (error) { next(error); }
};

export const respondToFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { response } = req.body;
    const adminId = (req as any).user.userId;
    const feedback = await feedbackService.respondToFeedback(id, response);
    await createAuditLog(adminId, 'ADMIN_FEEDBACK_RESPOND', req.ip, req.headers['user-agent'] as string, `Admin responded to feedback ID ${id}`);
    res.json({ success: true, message: 'Response sent', data: feedback });
  } catch (error) { next(error); }
};
