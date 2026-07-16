import { BaseRobotAdapter, RobotConnectionState, CommandResult, TelemetryData, RobotStatus } from './base-adapter';
import { eventBus, RobotEvent } from '../../event-bus/index';
import { logger } from '../../../utils/logger.utils';
import prisma from '../../../config/database';
import * as sensorService from '../../../services/sensor.service';
import { parseArduinoCSV } from '../../../iot/arduino/dataParser';
import { validateArduinoData } from '../../../iot/arduino/validator';
import { RobotPacket, PacketType, validatePacket, createPacket } from '../../protocol';

export class ArduinoAdapter extends BaseRobotAdapter {
  private simulatorInterval: NodeJS.Timeout | null = null;
  private io: any = null;

  constructor() {
    super('arduino-serial');
  }

  setIO(io: any): void {
    this.io = io;
  }

  async connect(robotId: string): Promise<void> {
    logger.info(`Arduino adapter: Connecting robot ${robotId}`);
    this.setConnectionState(robotId, RobotConnectionState.ONLINE);
    eventBus.emit(RobotEvent.ROBOT_CONNECTED, { robotId, adapter: this.adapterType });
  }

  async disconnect(robotId: string): Promise<void> {
    logger.info(`Arduino adapter: Disconnecting robot ${robotId}`);
    this.setConnectionState(robotId, RobotConnectionState.OFFLINE);
    eventBus.emit(RobotEvent.ROBOT_DISCONNECTED, { robotId, reason: 'adapter_disconnect' });
  }

  async handlePacket(packet: RobotPacket): Promise<void> {
    const errors = validatePacket(packet);
    if (errors.length > 0) {
      logger.warn(`Invalid packet from robot ${packet.header.robotId}: ${errors.join(', ')}`);
      return;
    }

    const { robotId, packetType } = packet.header;

    if (!this.isConnected(robotId)) {
      await this.connect(robotId);
    }

    switch (packetType) {
      case PacketType.HEARTBEAT:
        eventBus.emit(RobotEvent.ROBOT_HEARTBEAT, {
          robotId,
          timestamp: new Date(packet.header.timestamp),
          ...packet.payload,
        });
        break;

      case PacketType.TELEMETRY:
        eventBus.emit(RobotEvent.TELEMETRY_RECEIVED, { robotId, data: packet.payload });
        break;

      case PacketType.ALERT:
        eventBus.emit(RobotEvent.ALERT_GENERATED, { robotId, alert: packet.payload });
        break;

      case PacketType.ACKNOWLEDGEMENT:
        eventBus.emit(RobotEvent.COMMAND_ACKNOWLEDGED, {
          commandId: (packet.payload as any).commandId,
          robotId,
          status: (packet.payload as any).status || 'completed',
        });
        break;

      default:
        logger.info(`Unhandled packet type ${packetType} from robot ${robotId}`);
    }
  }

  async sendCommand(robotId: string, command: string, commandId: string, params?: any): Promise<CommandResult> {
    logger.info(`Arduino adapter: Sending command ${command} to robot ${robotId}`);

    eventBus.emit(RobotEvent.COMMAND_SENT, { commandId, robotId, command });

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 300));

    const result: CommandResult = {
      success: true,
      commandId,
      command,
      robotId,
      status: 'completed',
      message: `Command ${command} executed via Arduino serial`,
      executedAt: new Date(),
    };

    eventBus.emit(RobotEvent.COMMAND_ACKNOWLEDGED, { commandId, robotId, status: 'completed' });
    return result;
  }

  async getStatus(robotId: string): Promise<RobotStatus> {
    const robot = await prisma.robot.findUnique({ where: { id: robotId } });
    const reading = await prisma.sensorReading.findFirst({
      where: { robotId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      robotId,
      state: this.getConnectionState(robotId),
      battery: reading?.battery,
      firmwareVersion: robot?.firmwareVersion || undefined,
      hardwareVersion: robot?.hardwareVersion || undefined,
      signalStrength: reading?.signalStrength,
      lastSeen: reading?.createdAt,
      healthStatus: reading ? 'NOMINAL' : 'UNKNOWN',
    };
  }

  async getTelemetry(robotId: string): Promise<TelemetryData | null> {
    const reading = await prisma.sensorReading.findFirst({
      where: { robotId },
      orderBy: { createdAt: 'desc' },
    });
    if (!reading) return null;
    return {
      robotId: reading.robotId,
      humidity: reading.humidity,
      temperature: reading.temperature,
      waterFlow: reading.waterFlow,
      waterLevel: reading.waterLevel,
      powerConsumption: reading.powerConsumption,
      battery: reading.battery,
      voltage: reading.voltage,
      current: reading.current,
      motorStatus: reading.motorStatus,
      pumpStatus: reading.pumpStatus,
      relayStatus: reading.relayStatus,
      fanStatus: reading.fanStatus,
      movementState: reading.movementState,
      currentMode: reading.currentMode,
      obstacle: reading.obstacle,
      irDetection: reading.irDetection,
      signalStrength: reading.signalStrength,
      runtime: reading.runtime,
      firmwareVersion: reading.firmwareVersion || undefined,
      hardwareRevision: reading.hardwareRevision || undefined,
      timestamp: reading.createdAt,
    };
  }

  startSimulator(): void {
    if (this.simulatorInterval) return;

    logger.info('Arduino IoT Simulator started (10s interval)');
    this.simulatorInterval = setInterval(async () => {
      try {
        const robots = await prisma.robot.findMany({
          where: { status: 'ONLINE' },
          select: { id: true, status: true, firmwareVersion: true, hardwareVersion: true },
        });
        if (robots.length === 0) return;

        for (const robot of robots) {
          await this.simulateReading(robot.id, robot.status, robot.firmwareVersion, robot.hardwareVersion);
        }
      } catch (err: any) {
        logger.error('Arduino simulator error:', { error: err.message });
      }
    }, 10000);
  }

  private async simulateReading(robotId: string, _status: string, firmwareVersion?: string | null, hardwareVersion?: string | null): Promise<void> {
    const temperature = +(20 + Math.random() * 15).toFixed(1);
    const humidity = +(40 + Math.random() * 40).toFixed(1);
    const waterFlow = +(0.05 + Math.random() * 0.20).toFixed(2);

    const latestReading = await prisma.sensorReading.findFirst({
      where: { robotId },
      orderBy: { createdAt: 'desc' },
    });

    let currentLevel = latestReading ? latestReading.waterLevel : 0;
    currentLevel = +(currentLevel + waterFlow).toFixed(2);
    if (currentLevel > 50) currentLevel = 0;

    const powerConsumption = +(0.02 + Math.random() * 0.08).toFixed(3);

    const csvLine = `${robotId},${humidity},${temperature},${waterFlow},${currentLevel},${powerConsumption}`;
    const parsed = parseArduinoCSV(csvLine);
    validateArduinoData(parsed);

    // Build protocol-compliant packet
    const packet = createPacket(robotId, PacketType.TELEMETRY, parsed, {
      firmwareVersion: firmwareVersion || '1.0.0',
      hardwareVersion: hardwareVersion || 'v1.0',
    });

    eventBus.emit(RobotEvent.TELEMETRY_RECEIVED, { robotId, data: packet.payload });

    const result = await sensorService.ingestSensorReading(packet.payload);

    eventBus.emit(RobotEvent.TELEMETRY_STORED, { robotId, reading: result.reading, alerts: result.alerts });

    // Single source of truth for Socket.IO emissions through event bus only
    if (result.alerts.length > 0) {
      for (const alert of result.alerts) {
        eventBus.emit(RobotEvent.ALERT_GENERATED, { robotId, alert });
      }
    }
  }

  stopSimulator(): void {
    if (this.simulatorInterval) {
      clearInterval(this.simulatorInterval);
      this.simulatorInterval = null;
      logger.info('Arduino IoT Simulator stopped');
    }
  }

  async dispose(): Promise<void> {
    this.stopSimulator();
    for (const robotId of this.getConnectedRobots()) {
      await this.disconnect(robotId);
    }
  }
}

export const arduinoAdapter = new ArduinoAdapter();
