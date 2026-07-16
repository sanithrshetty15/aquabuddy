import prisma from '../config/database';
import { SENSOR_THRESHOLDS } from '../utils/constants';
import { NotFoundError, ValidationError } from '../utils/error.utils';
import { PaginationParams, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.utils';

export interface SensorData {
  robotId: string;
  humidity: number;
  temperature: number;
  waterFlow: number;
  waterLevel: number;
  powerConsumption: number;
  battery?: number;
  voltage?: number;
  current?: number;
  motorStatus?: string;
  pumpStatus?: string;
  relayStatus?: string;
  fanStatus?: string;
  movementState?: string;
  currentMode?: string;
  obstacle?: boolean;
  irDetection?: boolean;
  signalStrength?: number;
  runtime?: number;
  firmwareVersion?: string;
  hardwareRevision?: string;
}

export interface SensorHistoryQuery {
  robotId: string;
  startDate?: Date;
  endDate?: Date;
  pagination: PaginationParams;
}

/**
 * Ingest a new sensor reading from IoT device, store it, and check thresholds
 * Returns the created reading + any generated alerts
 */
export const ingestSensorReading = async (data: SensorData) => {
  // Validate robot exists
  const robot = await prisma.robot.findUnique({ where: { id: data.robotId } });
  if (!robot) {
    throw new NotFoundError(`Robot not found: ${data.robotId}`);
  }

  // Validate sensor bounds
  if (data.humidity < 0 || data.humidity > 100) {
    throw new ValidationError('Humidity must be between 0 and 100');
  }
  if (data.temperature < -50 || data.temperature > 100) {
    throw new ValidationError('Temperature must be between -50 and 100');
  }

  // Store the reading
  const reading = await prisma.sensorReading.create({
    data: {
      robotId: data.robotId,
      humidity: data.humidity,
      temperature: data.temperature,
      waterFlow: data.waterFlow,
      waterLevel: data.waterLevel,
      powerConsumption: data.powerConsumption,
      battery: data.battery ?? 100,
      voltage: data.voltage ?? 220,
      current: data.current ?? 0,
      motorStatus: data.motorStatus ?? 'OFF',
      pumpStatus: data.pumpStatus ?? 'OFF',
      relayStatus: data.relayStatus ?? 'OFF',
      fanStatus: data.fanStatus ?? 'OFF',
      movementState: data.movementState ?? 'STATIONARY',
      currentMode: data.currentMode ?? 'AUTOMATIC',
      obstacle: data.obstacle ?? false,
      irDetection: data.irDetection ?? false,
      signalStrength: data.signalStrength ?? -50,
      runtime: data.runtime ?? 0,
      firmwareVersion: data.firmwareVersion,
      hardwareRevision: data.hardwareRevision,
    },
  });

  // Update robot's water generated and last updated
  await prisma.robot.update({
    where: { id: data.robotId },
    data: {
      waterGenerated: { increment: data.waterFlow },
      lastUpdated: new Date(),
    },
  });

  // Check thresholds and generate alerts
  const alerts = await checkThresholds(data);

  return { reading, alerts };
};

/**
 * Get sensor history for a robot
 */
export const getSensorHistory = async (query: SensorHistoryQuery): Promise<PaginatedResponse<any>> => {
  const { robotId, startDate, endDate, pagination } = query;

  const robot = await prisma.robot.findUnique({ where: { id: robotId } });
  if (!robot) {
    throw new NotFoundError(`Robot not found: ${robotId}`);
  }

  const where: any = { robotId };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [readings, total] = await Promise.all([
    prisma.sensorReading.findMany({
      where,
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.sensorReading.count({ where }),
  ]);

  return buildPaginatedResponse(readings, total, pagination);
};

/**
 * Get real-time (latest) sensor reading for a robot
 */
export const getLatestReading = async (robotId: string) => {
  const robot = await prisma.robot.findUnique({ where: { id: robotId } });
  if (!robot) {
    throw new NotFoundError(`Robot not found: ${robotId}`);
  }

  const reading = await prisma.sensorReading.findFirst({
    where: { robotId },
    orderBy: { createdAt: 'desc' },
  });

  return reading;
};

/**
 * Get aggregated sensor stats for a robot
 */
export const getSensorStats = async (robotId: string, hours: number = 24) => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const readings = await prisma.sensorReading.findMany({
    where: {
      robotId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (readings.length === 0) {
    return {
      avgHumidity: 0,
      avgTemperature: 0,
      totalWaterFlow: 0,
      maxWaterLevel: 0,
      totalPower: 0,
      readingCount: 0,
      timeRange: { start: since, end: new Date() },
    };
  }

  const stats = readings.reduce(
    (acc, r) => ({
      sumHumidity: acc.sumHumidity + r.humidity,
      sumTemperature: acc.sumTemperature + r.temperature,
      totalWaterFlow: acc.totalWaterFlow + r.waterFlow,
      maxWaterLevel: Math.max(acc.maxWaterLevel, r.waterLevel),
      totalPower: acc.totalPower + r.powerConsumption,
    }),
    { sumHumidity: 0, sumTemperature: 0, totalWaterFlow: 0, maxWaterLevel: 0, totalPower: 0 }
  );

  return {
    avgHumidity: +(stats.sumHumidity / readings.length).toFixed(1),
    avgTemperature: +(stats.sumTemperature / readings.length).toFixed(1),
    totalWaterFlow: +stats.totalWaterFlow.toFixed(2),
    maxWaterLevel: +stats.maxWaterLevel.toFixed(1),
    totalPower: +stats.totalPower.toFixed(2),
    readingCount: readings.length,
    timeRange: {
      start: readings[0].createdAt,
      end: readings[readings.length - 1].createdAt,
    },
  };
};

/**
 * Check sensor values against thresholds and create alerts if needed
 */
const checkThresholds = async (data: SensorData) => {
  const alerts: any[] = [];

  if (data.temperature >= SENSOR_THRESHOLDS.TEMPERATURE_HIGH) {
    alerts.push(
      await prisma.alert.create({
        data: {
          robotId: data.robotId,
          type: 'TEMPERATURE_HIGH',
          severity: data.temperature >= 50 ? 'CRITICAL' : 'WARNING',
          message: `Temperature reading of ${data.temperature}°C exceeds threshold of ${SENSOR_THRESHOLDS.TEMPERATURE_HIGH}°C`,
        },
      })
    );
  }

  if (data.humidity <= SENSOR_THRESHOLDS.HUMIDITY_LOW) {
    alerts.push(
      await prisma.alert.create({
        data: {
          robotId: data.robotId,
          type: 'HUMIDITY_LOW',
          severity: data.humidity <= 10 ? 'CRITICAL' : 'WARNING',
          message: `Humidity reading of ${data.humidity}% is below threshold of ${SENSOR_THRESHOLDS.HUMIDITY_LOW}%`,
        },
      })
    );
  }

  if (data.waterLevel >= SENSOR_THRESHOLDS.WATER_TANK_CAPACITY * 0.95) {
    alerts.push(
      await prisma.alert.create({
        data: {
          robotId: data.robotId,
          type: 'TANK_FULL',
          severity: data.waterLevel >= SENSOR_THRESHOLDS.WATER_TANK_CAPACITY ? 'CRITICAL' : 'WARNING',
          message: `Water tank at ${data.waterLevel}L / ${SENSOR_THRESHOLDS.WATER_TANK_CAPACITY}L capacity`,
        },
      })
    );
  }

  if (data.waterLevel <= 0 && data.waterLevel !== undefined) {
    alerts.push(
      await prisma.alert.create({
        data: {
          robotId: data.robotId,
          type: 'TANK_EMPTY',
          severity: 'CRITICAL',
          message: 'Water tank is empty',
        },
      })
    );
  }

  if (typeof data.battery === 'number' && data.battery <= 15) {
    alerts.push(
      await prisma.alert.create({
        data: {
          robotId: data.robotId,
          type: 'BATTERY_LOW',
          severity: data.battery <= 5 ? 'CRITICAL' : 'WARNING',
          message: `Battery level at ${data.battery}%`,
        },
      })
    );
  }

  return alerts;
};
