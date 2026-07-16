import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/error.utils';
import { RobotStatus } from '@prisma/client';
import { eventBus, RobotEvent } from '../robot/event-bus/index';
import { logger } from '../utils/logger.utils';

const VALID_TRANSITIONS: Record<RobotStatus, RobotStatus[]> = {
  MANUFACTURED: ['TESTING'],
  TESTING: ['READY', 'MANUFACTURED'],
  READY: ['ACTIVATED'],
  ACTIVATED: ['ONLINE', 'OFFLINE'],
  ONLINE: ['OFFLINE', 'MAINTENANCE', 'FIRMWARE_UPDATE', 'SERVICE', 'RETIRED'],
  OFFLINE: ['ONLINE', 'ACTIVATED', 'RETIRED'],
  MAINTENANCE: ['ONLINE', 'SERVICE', 'RETIRED'],
  FIRMWARE_UPDATE: ['ONLINE', 'OFFLINE', 'RETIRED'],
  SERVICE: ['ONLINE', 'RETIRED'],
  RETIRED: [],
};

const TERMINAL_STATES: RobotStatus[] = ['RETIRED'];

export class LifecycleService {
  isValidTransition(from: RobotStatus, to: RobotStatus): boolean {
    const allowed = VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  async transition(
    robotId: string,
    toStatus: RobotStatus,
    options?: { triggeredBy?: string; reason?: string }
  ): Promise<any> {
    const robot = await prisma.robot.findUnique({ where: { id: robotId } });
    if (!robot) throw new NotFoundError('Robot not found');

    const fromStatus = robot.status as RobotStatus;

    if (fromStatus === toStatus) {
      return robot;
    }

    if (TERMINAL_STATES.includes(fromStatus)) {
      throw new ValidationError(`Robot is already in terminal state: ${fromStatus}`);
    }

    if (!this.isValidTransition(fromStatus, toStatus)) {
      throw new ValidationError(
        `Invalid state transition: ${fromStatus} → ${toStatus}. Allowed: ${VALID_TRANSITIONS[fromStatus]?.join(', ') || 'none'}`
      );
    }

    const [updated] = await Promise.all([
      prisma.robot.update({
        where: { id: robotId },
        data: { status: toStatus, lastUpdated: new Date() },
      }),
      prisma.lifecycleEvent.create({
        data: {
          robotId,
          fromStatus,
          toStatus,
          triggeredBy: options?.triggeredBy,
          reason: options?.reason,
        },
      }),
    ]);

    eventBus.emit(RobotEvent.ROBOT_STATUS_CHANGE, {
      robotId,
      status: toStatus,
      previousStatus: fromStatus,
    });

    logger.info(`Robot ${robotId}: ${fromStatus} → ${toStatus}${options?.reason ? ` (${options.reason})` : ''}`);

    return updated;
  }

  async getLifecycleHistory(robotId: string): Promise<any[]> {
    const robot = await prisma.robot.findUnique({ where: { id: robotId } });
    if (!robot) throw new NotFoundError('Robot not found');

    return prisma.lifecycleEvent.findMany({
      where: { robotId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async canSendCommand(robotId: string): Promise<{ allowed: boolean; reason?: string }> {
    const robot = await prisma.robot.findUnique({ where: { id: robotId } });
    if (!robot) throw new NotFoundError('Robot not found');

    const status = robot.status as RobotStatus;

    if (status === 'RETIRED') {
      return { allowed: false, reason: 'Robot is retired. No commands allowed.' };
    }

    if (status === 'MAINTENANCE' || status === 'SERVICE') {
      return { allowed: false, reason: `Robot is in ${status} mode. Commands are blocked.` };
    }

    if (status === 'FIRMWARE_UPDATE') {
      return { allowed: false, reason: 'Robot is performing a firmware update. Commands are blocked.' };
    }

    if (status === 'MANUFACTURED' || status === 'TESTING' || status === 'READY') {
      return { allowed: false, reason: `Robot is in pre-activation state: ${status}.` };
    }

    return { allowed: true };
  }
}

export const lifecycleService = new LifecycleService();
