import prisma from '../../../config/database';

export interface AggregatedTelemetry {
  robotId: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  avgHumidity: number;
  avgTemperature: number;
  totalWaterFlow: number;
  avgWaterLevel: number;
  totalPowerConsumption: number;
  avgBattery: number;
  minBattery: number;
  readingCount: number;
}

export class TelemetryAggregator {
  async aggregateHourly(robotId: string, date: Date): Promise<AggregatedTelemetry> {
    const start = new Date(date);
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    return this.aggregate(robotId, start, end, 'hourly');
  }

  async aggregateDaily(robotId: string, date: Date): Promise<AggregatedTelemetry> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    return this.aggregate(robotId, start, end, 'daily');
  }

  async aggregateWeekly(robotId: string, date: Date): Promise<AggregatedTelemetry> {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return this.aggregate(robotId, start, end, 'weekly');
  }

  private async aggregate(
    robotId: string,
    start: Date,
    end: Date,
    period: 'hourly' | 'daily' | 'weekly' | 'monthly'
  ): Promise<AggregatedTelemetry> {
    const readings = await prisma.sensorReading.findMany({
      where: {
        robotId,
        createdAt: { gte: start, lt: end },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (readings.length === 0) {
      return {
        robotId,
        period,
        startDate: start,
        endDate: end,
        avgHumidity: 0,
        avgTemperature: 0,
        totalWaterFlow: 0,
        avgWaterLevel: 0,
        totalPowerConsumption: 0,
        avgBattery: 0,
        minBattery: 0,
        readingCount: 0,
      };
    }

    const sum = readings.reduce(
      (acc, r) => ({
        humidity: acc.humidity + r.humidity,
        temperature: acc.temperature + r.temperature,
        waterFlow: acc.waterFlow + r.waterFlow,
        waterLevel: acc.waterLevel + r.waterLevel,
        powerConsumption: acc.powerConsumption + r.powerConsumption,
        battery: acc.battery + r.battery,
      }),
      { humidity: 0, temperature: 0, waterFlow: 0, waterLevel: 0, powerConsumption: 0, battery: 0 }
    );

    return {
      robotId,
      period,
      startDate: start,
      endDate: end,
      avgHumidity: +(sum.humidity / readings.length).toFixed(1),
      avgTemperature: +(sum.temperature / readings.length).toFixed(1),
      totalWaterFlow: +sum.waterFlow.toFixed(2),
      avgWaterLevel: +(sum.waterLevel / readings.length).toFixed(1),
      totalPowerConsumption: +sum.powerConsumption.toFixed(2),
      avgBattery: +(sum.battery / readings.length).toFixed(0),
      minBattery: Math.min(...readings.map(r => r.battery)),
      readingCount: readings.length,
    };
  }
}

export const telemetryAggregator = new TelemetryAggregator();
