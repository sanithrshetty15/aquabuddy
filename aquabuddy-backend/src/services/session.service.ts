import { sessionRepository } from '../repositories';
import { NotFoundError, UnauthorizedError } from '../utils/error.utils';

export const getUserSessions = async (userId: string) => {
  return sessionRepository.findActiveByUserId(userId);
};

export const revokeSession = async (sessionId: string, userId: string, isAdmin: boolean = false) => {
  const session = await sessionRepository.findById(sessionId);
  if (!session) throw new NotFoundError('Session not found');
  if (!isAdmin && session.userId !== userId) throw new UnauthorizedError('Not your session');
  return sessionRepository.revokeSession(sessionId);
};

export const revokeAllSessions = async (userId: string) => {
  return sessionRepository.revokeAllUserSessions(userId);
};

export const getAllSessions = async () => {
  return sessionRepository.findMany({}, {
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
};
