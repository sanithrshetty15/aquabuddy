import prisma from '../config/database';
import { NotFoundError } from '../utils/error.utils';
import { heartbeatService } from '../robot/communication/health/heartbeat.service';
import { RobotConnectionState } from '../robot/communication/adapters';

export interface DigitalTwin {
  robotId: string;
  status: string;
  connection: {
    state: string;
    lastSeen: Date | null;
    signalStrength: number;
    healthStatus: string;
  };
  telemetry: {
    humidity: number;
    temperature: number;
    waterLevel: number;
    waterFlow: number;
    battery: number;
    powerConsumption: number;
    pumpStatus: string;
    relayStatus: string;
    fanStatus: string;
    motorStatus: string;
    movementState: string;
    currentMode: string;
    obstacle: boolean;
    irDetection: boolean;
  } | null;
  location: {
    lat: number;
    lng: number;
  };
  firmware: {
    version: string | null;
    hardwareVersion: string | null;
  };
  metrics: {
    waterGenerated: number;
    runtime: number;
  };
  updatedAt: string;
}

export class DigitalTwinService {
  async getTwin(robotId: string): Promise<DigitalTwin> {
    const robot = await prisma.robot.findUnique({ where: { id: robotId } });
    if (!robot) throw new NotFoundError('Robot not found');

    const reading = await prisma.sensorReading.findFirst({
      where: { robotId },
      orderBy: { createdAt: 'desc' },
    });

    const heartbeat = heartbeatService.getDetailedStatus(robotId);
    const connectionState = heartbeat?.status || 'UNKNOWN';

    return {
      robotId: robot.id,
      status: robot.status,
      connection: {
        state: connectionState,
        lastSeen: reading?.createdAt || null,
        signalStrength: heartbeat?.signalStrength ?? reading?.signalStrength ?? -50,
        healthStatus: heartbeat?.healthStatus || 'UNKNOWN',
      },
      telemetry: reading ? {
        humidity: reading.humidity,
        temperature: reading.temperature,
        waterLevel: reading.waterLevel,
        waterFlow: reading.waterFlow,
        battery: reading.battery,
        powerConsumption: reading.powerConsumption,
        pumpStatus: reading.pumpStatus,
        relayStatus: reading.relayStatus,
        fanStatus: reading.fanStatus,
        motorStatus: reading.motorStatus,
        movementState: reading.movementState,
        currentMode: reading.currentMode,
        obstacle: reading.obstacle,
        irDetection: reading.irDetection,
      } : null,
      location: { lat: robot.lat, lng: robot.lng },
      firmware: {
        version: robot.firmwareVersion,
        hardwareVersion: robot.hardwareVersion,
      },
      metrics: {
        waterGenerated: robot.waterGenerated,
        runtime: reading?.runtime || 0,
      },
      updatedAt: robot.lastUpdated.toISOString(),
    };
  }
}

export const digitalTwinService = new DigitalTwinService();
