import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class FirmwareRepository extends BaseRepository<any, any> {
  protected delegate = prisma.firmwareRecord as any;
  protected modelName = 'FirmwareRecord';

  async findByModel(robotModel: string) {
    return prisma.firmwareRecord.findMany({
      where: { robotModel, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLatestByModel(robotModel: string) {
    return prisma.firmwareRecord.findFirst({
      where: { robotModel, status: 'RELEASED', deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findDeploymentsByRobot(robotId: string) {
    return prisma.robotFirmwareDeployment.findMany({
      where: { robotId, deletedAt: null },
      include: { firmware: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDeployment(data: any) {
    return prisma.robotFirmwareDeployment.create({ data });
  }

  async updateDeploymentStatus(id: string, status: string, errorMessage?: string) {
    const data: any = { status };
    if (status === 'DOWNLOADING') data.deployedAt = new Date();
    if (status === 'SUCCESS' || status === 'FAILED') data.completedAt = new Date();
    if (errorMessage) data.errorMessage = errorMessage;
    return prisma.robotFirmwareDeployment.update({ where: { id }, data });
  }
}

export const firmwareRepository = new FirmwareRepository();
