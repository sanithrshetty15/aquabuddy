import { eventBus, RobotEvent } from '../../event-bus/index';
import { adapterRegistry, RobotConnectionState } from '../adapters';
import { logger } from '../../../utils/logger.utils';
import prisma from '../../../config/database';

const HEARTBEAT_INTERVAL_MS = 5000;
const OFFLINE_THRESHOLD_MS = 15000;
const RECONNECTING_THRESHOLD_MS = 30000;

interface RobotHeartbeatState {
  robotId: string;
  lastHeartbeat: Date;
  status: 'ONLINE' | 'OFFLINE' | 'RECONNECTING' | 'UNKNOWN';
  missedBeats: number;
  battery: number;
  signalStrength: number;
  firmwareVersion: string;
  healthStatus: string;
}

export class HeartbeatService {
  private heartbeats = new Map<string, RobotHeartbeatState>();
  private intervalId: NodeJS.Timeout | null = null;

  registerHeartbeat(
    robotId: string,
    data?: { battery?: number; signalStrength?: number; firmwareVersion?: string; healthStatus?: string }
  ): void {
    const existing = this.heartbeats.get(robotId);
    if (existing) {
      existing.lastHeartbeat = new Date();
      existing.missedBeats = 0;
      if (data?.battery !== undefined) existing.battery = data.battery;
      if (data?.signalStrength !== undefined) existing.signalStrength = data.signalStrength;
      if (data?.firmwareVersion) existing.firmwareVersion = data.firmwareVersion;
      if (data?.healthStatus) existing.healthStatus = data.healthStatus;
      if (existing.status !== 'ONLINE') {
        const previousStatus = existing.status;
        existing.status = 'ONLINE';
        eventBus.emit(RobotEvent.ROBOT_STATUS_CHANGE, {
          robotId,
          status: 'ONLINE',
          previousStatus,
        });
      }
    } else {
      this.heartbeats.set(robotId, {
        robotId,
        lastHeartbeat: new Date(),
        status: 'ONLINE',
        missedBeats: 0,
        battery: data?.battery ?? 100,
        signalStrength: data?.signalStrength ?? -50,
        firmwareVersion: data?.firmwareVersion ?? '1.0.0',
        healthStatus: data?.healthStatus ?? 'NOMINAL',
      });
    }

    eventBus.emit(RobotEvent.ROBOT_HEARTBEAT, {
      robotId,
      timestamp: new Date(),
      battery: this.heartbeats.get(robotId)!.battery,
      signalStrength: this.heartbeats.get(robotId)!.signalStrength,
      firmwareVersion: this.heartbeats.get(robotId)!.firmwareVersion,
      healthStatus: this.heartbeats.get(robotId)!.healthStatus,
    });
  }

  unregisterRobot(robotId: string): void {
    this.heartbeats.delete(robotId);
  }

  getStatus(robotId: string): 'ONLINE' | 'OFFLINE' | 'RECONNECTING' | 'UNKNOWN' {
    return this.heartbeats.get(robotId)?.status || 'UNKNOWN';
  }

  getDetailedStatus(robotId: string): RobotHeartbeatState | undefined {
    return this.heartbeats.get(robotId);
  }

  getAllStatuses(): Array<{
    robotId: string;
    status: string;
    lastHeartbeat: Date;
    missedBeats: number;
    battery: number;
    signalStrength: number;
    firmwareVersion: string;
    healthStatus: string;
  }> {
    const result: Array<{
      robotId: string;
      status: string;
      lastHeartbeat: Date;
      missedBeats: number;
      battery: number;
      signalStrength: number;
      firmwareVersion: string;
      healthStatus: string;
    }> = [];
    for (const [, state] of this.heartbeats) {
      result.push({
        robotId: state.robotId,
        status: state.status,
        lastHeartbeat: state.lastHeartbeat,
        missedBeats: state.missedBeats,
        battery: state.battery,
        signalStrength: state.signalStrength,
        firmwareVersion: state.firmwareVersion,
        healthStatus: state.healthStatus,
      });
    }
    return result;
  }

  start(): void {
    if (this.intervalId) return;

    logger.info(`Heartbeat service started (check every ${HEARTBEAT_INTERVAL_MS}ms)`);

    this.intervalId = setInterval(() => {
      const now = Date.now();
      for (const [robotId, state] of this.heartbeats) {
        const elapsed = now - state.lastHeartbeat.getTime();

        if (elapsed > RECONNECTING_THRESHOLD_MS && state.status !== 'OFFLINE') {
          const previousStatus = state.status;
          state.status = 'OFFLINE';
          state.missedBeats++;
          logger.warn(`Robot ${robotId} went OFFLINE (missed ${state.missedBeats} heartbeats)`);
          eventBus.emit(RobotEvent.ROBOT_STATUS_CHANGE, {
            robotId,
            status: 'OFFLINE',
            previousStatus,
          });
          eventBus.emit(RobotEvent.ROBOT_DISCONNECTED, {
            robotId,
            reason: `Heartbeat timeout: ${elapsed}ms since last heartbeat`,
          });
        } else if (elapsed > OFFLINE_THRESHOLD_MS && state.status === 'ONLINE') {
          const previousStatus = state.status;
          state.status = 'RECONNECTING';
          state.missedBeats++;
          logger.warn(`Robot ${robotId} is RECONNECTING (missed ${state.missedBeats} heartbeats)`);
          eventBus.emit(RobotEvent.ROBOT_STATUS_CHANGE, {
            robotId,
            status: 'RECONNECTING',
            previousStatus,
          });
        }
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Heartbeat service stopped');
    }
  }
}

export const heartbeatService = new HeartbeatService();
