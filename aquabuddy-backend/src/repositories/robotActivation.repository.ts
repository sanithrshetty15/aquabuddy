import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class RobotActivationRepository extends BaseRepository<any, any> {
  protected delegate = prisma.robotActivation as any;
  protected modelName = 'RobotActivation';

  async findByCode(code: string) {
    return prisma.robotActivation.findFirst({ where: { code, deletedAt: null } });
  }

  async findByRobotId(robotId: string) {
    return prisma.robotActivation.findFirst({ where: { robotId, deletedAt: null } });
  }
}

export const robotActivationRepository = new RobotActivationRepository();
