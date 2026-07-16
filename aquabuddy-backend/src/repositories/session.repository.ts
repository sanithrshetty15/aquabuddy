import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class SessionRepository extends BaseRepository<any, any> {
  protected delegate = prisma.session as any;
  protected modelName = 'Session';

  async findByToken(token: string) {
    return prisma.session.findFirst({ where: { token, deletedAt: null } });
  }

  async findActiveByUserId(userId: string) {
    return prisma.session.findMany({
      where: { userId, deletedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async revokeSession(id: string) {
    return prisma.session.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async revokeAllUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }
}

export const sessionRepository = new SessionRepository();
