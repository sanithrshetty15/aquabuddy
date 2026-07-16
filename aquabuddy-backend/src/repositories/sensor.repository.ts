import prisma from '../config/database';
import { BaseRepository } from './base.repository';

export class SensorRepository extends BaseRepository<any, any> {
  protected delegate = prisma.sensorReading as any;
  protected modelName = 'SensorReading';

  async findLatestByRobotId(robotId: string) {
    return prisma.sensorReading.findFirst({
      where: { robotId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByRobotId(robotId: string, limit: number = 100) {
    return prisma.sensorReading.findMany({
      where: { robotId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStatsByRobotId(robotId: string) {
    const readings = await prisma.sensorReading.findMany({
      where: { robotId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (readings.length === 0) return null;

    return {
      avgHumidity: readings.reduce((s, r: any) => s + r.humidity, 0) / readings.length,
      avgTemperature: readings.reduce((s, r: any) => s + r.temperature, 0) / readings.length,
      avgWaterFlow: readings.reduce((s, r: any) => s + r.waterFlow, 0) / readings.length,
      avgPower: readings.reduce((s, r: any) => s + r.powerConsumption, 0) / readings.length,
      minBattery: Math.min(...readings.map((r: any) => r.battery)),
      maxBattery: Math.max(...readings.map((r: any) => r.battery)),
      currentBattery: readings[0].battery,
      latestReading: readings[0],
    };
  }
}

export const sensorRepository = new SensorRepository();
