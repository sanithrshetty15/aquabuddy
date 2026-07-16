import prisma from '../config/database';
import { NotFoundError } from '../utils/error.utils';
import { PaginationParams, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.utils';

export interface UserFeedbackQuery {
  userId: string;
  pagination: PaginationParams;
}

export interface AllFeedbackQuery {
  status?: string;
  search?: string;
  pagination: PaginationParams;
}

/**
 * Submit user feedback
 */
export const submitFeedback = async (data: {
  userId: string;
  subject: string;
  message: string;
  rating?: number;
  category?: string;
}) => {
  return prisma.feedback.create({
    data: {
      userId: data.userId,
      subject: data.subject,
      message: data.message,
      rating: data.rating,
      category: data.category,
    },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
};

/**
 * Get feedback for a user
 */
export const getUserFeedback = async (query: UserFeedbackQuery): Promise<PaginatedResponse<any>> => {
  const { userId, pagination } = query;
  const where = { userId };

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.feedback.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, pagination);
};

/**
 * Get all feedback (admin)
 */
export const getAllFeedback = async (query: AllFeedbackQuery): Promise<PaginatedResponse<any>> => {
  const { status, search, pagination } = query;
  const where: any = {};
  if (status && status !== 'ALL') where.status = status as any;

  if (search) {
    where.OR = [
      { subject: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.feedback.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, pagination);
};

/**
 * Respond to feedback (admin)
 */
export const respondToFeedback = async (id: string, response: string) => {
  const feedback = await prisma.feedback.findUnique({ where: { id } });
  if (!feedback) throw new NotFoundError(`Feedback not found: ${id}`);

  return prisma.feedback.update({
    where: { id },
    data: {
      response,
      status: 'RESPONDED',
      respondedAt: new Date(),
    },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
};
