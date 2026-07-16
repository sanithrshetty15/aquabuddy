import { BaseRobotAdapter, RobotConnectionState, CommandResult, TelemetryData, RobotStatus } from './base-adapter';
import { eventBus, RobotEvent } from '../../event-bus/index';
import { logger } from '../../../utils/logger.utils';
import prisma from '../../../config/database';
import * as sensorService from '../../../services/sensor.service';
import { parseESP32JSON } from '../../../iot/esp32/dataParser';
import { validateESP32Data } from '../../../iot/esp32/validator';
import { RobotPacket, PacketType, validatePacket, createPacket, isProtocolVersionSupported } from '../../protocol';

export class ESP32Adapter extends BaseRobotAdapter {
  private io: any = null;
  private connectedESP32 = new Map<string, string>();

  constructor() {
    super('esp32-wifi');
  }

  setIO(io: any): void {
    this.io = io;
  }

  async connect(robotId: string): Promise<void> {
    logger.info(`ESP32 adapter: Robot ${robotId} connected via WiFi`);
    this.setConnectionState(robotId, RobotConnectionState.ONLINE);
    this.connectedESP32.set(robotId, `ws-${robotId}`);
    eventBus.emit(RobotEvent.ROBOT_CONNECTED, { robotId, adapter: this.adapterType });
  }

  async disconnect(robotId: string): Promise<void> {
    logger.info(`ESP32 adapter: Robot ${robotId} disconnected`);
    this.setConnectionState(robotId, RobotConnectionState.OFFLINE);
    this.connectedESP32.delete(robotId);
    eventBus.emit(RobotEvent.ROBOT_DISCONNECTED, { robotId, reason: 'esp32_disconnect' });
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
    logger.info(`ESP32 adapter: Sending command ${command} to robot ${robotId} via WiFi`);

    // Wrap in protocol packet
    const packet = createPacket(robotId, PacketType.COMMAND, { command, commandId, params });

    eventBus.emit(RobotEvent.COMMAND_SENT, { commandId, robotId, command });

    if (this.io) {
      this.io.to(`robot:${robotId}`).emit('command:send', {
        ...packet,
        command,
        commandId,
        robotId,
        params,
      });
    }

    return {
      success: true,
      commandId,
      command,
      robotId,
      status: 'accepted',
      message: `Command ${command} sent via ESP32 WiFi to robot ${robotId}`,
    };
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

  async ingestESP32Data(body: any): Promise<any> {
    // Check for protocol-compliant packet
    if (body.header && body.payload) {
      const packet = body as RobotPacket;

      if (!isProtocolVersionSupported(packet.header.protocolVersion)) {
        throw new Error(`Unsupported protocol version: ${packet.header.protocolVersion}`);
      }

      await this.handlePacket(packet);

      // If telemetry, store it
      if (packet.header.packetType === PacketType.TELEMETRY) {
        return await sensorService.ingestSensorReading(packet.payload as any);
      }

      return { success: true };
    }

    // Legacy format (no protocol wrapper)
    const parsed = parseESP32JSON(body);
    validateESP32Data(parsed);

    const robotId = parsed.robotId;

    if (!this.isConnected(robotId)) {
      await this.connect(robotId);
    }

    eventBus.emit(RobotEvent.TELEMETRY_RECEIVED, { robotId, data: parsed });

    const result = await sensorService.ingestSensorReading(parsed);

    eventBus.emit(RobotEvent.TELEMETRY_STORED, { robotId, reading: result.reading, alerts: result.alerts });

    // Single source of truth for Socket.IO through event bus
    if (result.alerts.length > 0) {
      for (const alert of result.alerts) {
        eventBus.emit(RobotEvent.ALERT_GENERATED, { robotId, alert });
      }
    }

    return result;
  }

  handleWebSocketConnection(robotId: string): void {
    this.connect(robotId);
  }

  handleWebSocketDisconnection(robotId: string): void {
    this.disconnect(robotId);
  }

  async dispose(): Promise<void> {
    for (const robotId of this.getConnectedRobots()) {
      await this.disconnect(robotId);
    }
    this.connectedESP32.clear();
  }
}

export const esp32Adapter = new ESP32Adapter();
