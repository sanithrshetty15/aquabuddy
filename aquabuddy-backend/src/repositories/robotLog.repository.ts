import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class RobotLogRepository extends BaseRepository<any, any> {
  protected delegate = prisma.robotLog as any;
  protected modelName = 'RobotLog';

  async findByRobotId(robotId: string, limit: number = 50) {
    return prisma.robotLog.findMany({
      where: { robotId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findByLevel(level: string, limit: number = 50) {
    return prisma.robotLog.findMany({
      where: { level: level as any, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createLog(data: { robotId: string; level: string; message: string; source?: string; meta?: string }) {
    return prisma.robotLog.create({ data: data as any });
  }
}

export const robotLogRepository = new RobotLogRepository();
