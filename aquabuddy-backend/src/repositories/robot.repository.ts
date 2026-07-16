import { RobotStatus } from '@prisma/client';
import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class RobotRepository extends BaseRepository<any, any> {
  protected delegate = prisma.robot as any;
  protected modelName = 'Robot';

  async findByCode(code: string) {
    return prisma.robot.findFirst({ where: { code, deletedAt: null } });
  }

  async findByOwnerId(ownerId: string) {
    return prisma.robot.findMany({ where: { ownerId, deletedAt: null } });
  }

  async updateStatus(id: string, status: RobotStatus) {
    return prisma.robot.update({ where: { id }, data: { status, lastUpdated: new Date() } });
  }

  async linkToOwner(id: string, ownerId: string, name?: string) {
    return prisma.robot.update({
      where: { id },
      data: { ownerId, status: RobotStatus.ACTIVATED, name: name ?? undefined, lastUpdated: new Date() },
    });
  }
}

export const robotRepository = new RobotRepository();
