import prisma from '../config/database';
import { NotFoundError } from '../utils/error.utils';
import { HealthTier } from '@prisma/client';

interface HealthFactorScore {
  batteryScore: number;
  sensorScore: number;
  relayScore: number;
  pumpScore: number;
  fanScore: number;
  firmwareScore: number;
  maintenanceScore: number;
  runtimeScore: number;
  communicationScore: number;
  alertScore: number;
}

const BATTERY_WEIGHT = 0.15;
const SENSOR_WEIGHT = 0.15;
const RELAY_WEIGHT = 0.10;
const PUMP_WEIGHT = 0.10;
const FAN_WEIGHT = 0.05;
const FIRMWARE_WEIGHT = 0.10;
const MAINTENANCE_WEIGHT = 0.10;
const RUNTIME_WEIGHT = 0.05;
const COMMUNICATION_WEIGHT = 0.10;
const ALERT_WEIGHT = 0.10;

function calculateTier(score: number): HealthTier {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 75) return 'GOOD';
  if (score >= 60) return 'AVERAGE';
  if (score >= 40) return 'ATTENTION_REQUIRED';
  return 'CRITICAL';
}

export class HealthScoreService {
  async calculate(robotId: string): Promise<{
    overallScore: number;
    factors: HealthFactorScore;
    tier: HealthTier;
  }> {
    const robot = await prisma.robot.findUnique({ where: { id: robotId } });
    if (!robot) throw new NotFoundError('Robot not found');

    const latestReading = await prisma.sensorReading.findFirst({
      where: { robotId },
      orderBy: { createdAt: 'desc' },
    });

    const recentAlerts = await prisma.alert.findMany({
      where: { robotId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    });

    const recentMaintenance = await prisma.maintenanceLog.findFirst({
      where: { robotId },
      orderBy: { createdAt: 'desc' },
    });

    const recentService = await prisma.serviceHistory.findFirst({
      where: { robotId },
      orderBy: { performedAt: 'desc' },
    });

    const factors = this.computeFactors(
      robot,
      latestReading,
      recentAlerts,
      recentMaintenance,
      recentService
    );

    const overallScore = Math.round(
      factors.batteryScore * BATTERY_WEIGHT +
      factors.sensorScore * SENSOR_WEIGHT +
      factors.relayScore * RELAY_WEIGHT +
      factors.pumpScore * PUMP_WEIGHT +
      factors.fanScore * FAN_WEIGHT +
      factors.firmwareScore * FIRMWARE_WEIGHT +
      factors.maintenanceScore * MAINTENANCE_WEIGHT +
      factors.runtimeScore * RUNTIME_WEIGHT +
      factors.communicationScore * COMMUNICATION_WEIGHT +
      factors.alertScore * ALERT_WEIGHT
    );

    const tier = calculateTier(overallScore);

    await prisma.deviceHealthScore.create({
      data: {
        robotId,
        overallScore,
        ...factors,
        tier,
      },
    });

    return { overallScore, factors, tier };
  }

  private computeFactors(
    robot: any,
    reading: any,
    recentAlerts: any[],
    recentMaintenance: any,
    recentService: any
  ): HealthFactorScore {
    const batteryScore = reading ? this.scoreBattery(reading.battery) : 50;
    const sensorScore = reading ? this.scoreSensors(reading) : 50;
    const relayScore = reading && reading.relayStatus !== 'ERROR' ? 100 : 50;
    const pumpScore = reading && reading.pumpStatus !== 'ERROR' ? 100 : 50;
    const fanScore = reading && reading.fanStatus !== 'ERROR' ? 100 : 50;
    const firmwareScore = this.scoreFirmware(robot.firmwareVersion);
    const maintenanceScore = this.scoreMaintenance(recentMaintenance, recentService);
    const runtimeScore = reading ? this.scoreRuntime(reading.runtime) : 50;
    const communicationScore = reading ? this.scoreCommunication(reading.signalStrength) : 50;
    const alertScore = this.scoreAlerts(recentAlerts);

    return {
      batteryScore,
      sensorScore,
      relayScore,
      pumpScore,
      fanScore,
      firmwareScore,
      maintenanceScore,
      runtimeScore,
      communicationScore,
      alertScore,
    };
  }

  private scoreBattery(battery: number): number {
    if (battery >= 80) return 100;
    if (battery >= 60) return 80;
    if (battery >= 40) return 60;
    if (battery >= 20) return 40;
    if (battery >= 10) return 20;
    return 10;
  }

  private scoreSensors(reading: any): number {
    let healthy = 0;
    let total = 0;

    if (typeof reading.humidity === 'number') { total++; if (reading.humidity > 0) healthy++; }
    if (typeof reading.temperature === 'number') { total++; if (reading.temperature > -50) healthy++; }
    if (typeof reading.waterLevel === 'number') { total++; if (reading.waterLevel >= 0) healthy++; }
    if (typeof reading.waterFlow === 'number') { total++; if (reading.waterFlow >= 0) healthy++; }

    return total === 0 ? 50 : Math.round((healthy / total) * 100);
  }

  private scoreFirmware(version: string | null | undefined): number {
    if (!version) return 50;
    const parts = version.split('.').map(Number);
    if (parts.length < 2) return 50;
    if (parts[0] >= 2) return 100;
    if (parts[0] === 1 && parts[1] >= 5) return 90;
    if (parts[0] === 1 && parts[1] >= 2) return 75;
    if (parts[0] === 1 && parts[1] >= 0) return 60;
    return 40;
  }

  private scoreMaintenance(maintenanceLog: any, serviceRecord: any): number {
    const now = Date.now();
    const sixMonths = 180 * 24 * 60 * 60 * 1000;

    if (!maintenanceLog && !serviceRecord) return 50;

    const lastMaintenance = maintenanceLog?.createdAt?.getTime() || 0;
    const lastService = serviceRecord?.performedAt?.getTime() || 0;
    const latest = Math.max(lastMaintenance, lastService);

    const elapsed = now - latest;
    if (elapsed < sixMonths) return 100;
    if (elapsed < sixMonths * 2) return 75;
    if (elapsed < sixMonths * 3) return 50;
    return 25;
  }

  private scoreRuntime(runtime: number): number {
    if (runtime <= 0) return 100;
    const hours = runtime / 3600;
    if (hours < 1000) return 100;
    if (hours < 5000) return 80;
    if (hours < 10000) return 60;
    if (hours < 20000) return 40;
    return 20;
  }

  private scoreCommunication(signalStrength: number): number {
    if (signalStrength >= -50) return 100;
    if (signalStrength >= -70) return 80;
    if (signalStrength >= -85) return 60;
    if (signalStrength >= -100) return 40;
    return 20;
  }

  private scoreAlerts(alerts: any[]): number {
    if (alerts.length === 0) return 100;
    const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
    const warningCount = alerts.filter((a) => a.severity === 'WARNING').length;

    let score = 100;
    score -= criticalCount * 25;
    score -= warningCount * 10;

    return Math.max(0, Math.min(100, score));
  }
}

export const healthScoreService = new HealthScoreService();
