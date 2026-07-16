import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class AuditLogRepository extends BaseRepository<any, any> {
  protected delegate = prisma.auditLog as any;
  protected modelName = 'AuditLog';

  async findByUserId(userId: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByAction(action: string, limit: number = 50) {
    return prisma.auditLog.findMany({
      where: { action, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async log(data: { userId?: string; action: string; resource?: string; resourceId?: string; ipAddress?: string; userAgent?: string; details?: string }) {
    return prisma.auditLog.create({ data });
  }
}

export const auditLogRepository = new AuditLogRepository();
