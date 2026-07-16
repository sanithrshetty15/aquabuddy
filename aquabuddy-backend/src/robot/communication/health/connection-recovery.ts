import { eventBus, RobotEvent } from '../../event-bus/index';
import { logger } from '../../../utils/logger.utils';
import prisma from '../../../config/database';

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

interface RecoveryState {
  robotId: string;
  attempts: number;
  timerId: NodeJS.Timeout | null;
  lastError?: string;
}

export class ConnectionRecovery {
  private recoveryStates = new Map<string, RecoveryState>();

  startRecovery(robotId: string, error?: string): void {
    const existing = this.recoveryStates.get(robotId);
    if (existing) {
      existing.attempts++;
      existing.lastError = error;
    } else {
      this.recoveryStates.set(robotId, {
        robotId,
        attempts: 1,
        timerId: null,
        lastError: error,
      });
    }

    const state = this.recoveryStates.get(robotId)!;
    logger.warn(`Connection recovery started for robot ${robotId} (attempt ${state.attempts}/${MAX_RECONNECT_ATTEMPTS})`);

    if (state.attempts > MAX_RECONNECT_ATTEMPTS) {
      logger.error(`Robot ${robotId} exceeded max reconnect attempts. Generating alert.`);
      this.generateOfflineAlert(robotId, state.lastError || 'Max reconnect attempts exceeded');
      this.recoveryStates.delete(robotId);
      return;
    }

    const delay = Math.min(BASE_RETRY_DELAY_MS * Math.pow(2, state.attempts - 1), MAX_RETRY_DELAY_MS);

    eventBus.emit(RobotEvent.ROBOT_RECONNECTING, {
      robotId,
      attempt: state.attempts,
      maxAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    state.timerId = setTimeout(async () => {
      try {
        const robot = await prisma.robot.findUnique({ where: { id: robotId } });
        if (!robot) {
          this.recoveryStates.delete(robotId);
          return;
        }

        // Try to re-establish connection via each registered adapter
        // In a real implementation, this would ping the device
        logger.info(`Reconnect attempt ${state.attempts} for robot ${robotId}: Checking availability`);

        // Check if robot has recent sensor data (within last 30s)
        const recentReading = await prisma.sensorReading.findFirst({
          where: { robotId, createdAt: { gte: new Date(Date.now() - 30000) } },
        });

        if (recentReading) {
          logger.info(`Robot ${robotId} reconnected successfully (attempt ${state.attempts})`);
          eventBus.emit(RobotEvent.ROBOT_CONNECTED, { robotId, adapter: 'recovery' });
          this.recoveryStates.delete(robotId);
        } else {
          this.startRecovery(robotId, 'No recent telemetry data');
        }
      } catch (err: any) {
        logger.error(`Recovery attempt ${state.attempts} for robot ${robotId} failed:`, { error: err.message });
        this.startRecovery(robotId, err.message);
      }
    }, delay);
  }

  cancelRecovery(robotId: string): void {
    const state = this.recoveryStates.get(robotId);
    if (state?.timerId) {
      clearTimeout(state.timerId);
    }
    this.recoveryStates.delete(robotId);
  }

  private async generateOfflineAlert(robotId: string, reason: string): Promise<void> {
    try {
      await prisma.alert.create({
        data: {
          robotId,
          type: 'SYSTEM_ERROR',
          severity: 'CRITICAL',
          message: `Robot is offline and unreachable: ${reason}`,
          status: 'ACTIVE',
        },
      });
      logger.info(`Offline alert generated for robot ${robotId}`);
    } catch (err: any) {
      logger.error(`Failed to generate offline alert for robot ${robotId}:`, { error: err.message });
    }
  }

  getRecoveryState(robotId: string): RecoveryState | undefined {
    return this.recoveryStates.get(robotId);
  }

  isRecovering(robotId: string): boolean {
    return this.recoveryStates.has(robotId);
  }

  dispose(): void {
    for (const [, state] of this.recoveryStates) {
      if (state.timerId) clearTimeout(state.timerId);
    }
    this.recoveryStates.clear();
  }
}

export const connectionRecovery = new ConnectionRecovery();
