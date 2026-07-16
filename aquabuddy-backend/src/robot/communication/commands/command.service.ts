import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../config/database';
import { createAuditLog } from '../../../services/audit.service';
import { NotFoundError } from '../../../utils/error.utils';
import { logger } from '../../../utils/logger.utils';
import { commandQueue } from './command-queue';
import { adapterRegistry } from '../adapters';
import { eventBus, RobotEvent } from '../../event-bus/index';

const COMMAND_TIMEOUT_MS = 5000;

export class RobotCommandService {
  private pendingTimeouts = new Map<string, NodeJS.Timeout>();

  async executeCommand(payload: {
    command: string;
    robotId: string;
    userId: string;
    params?: Record<string, any>;
    priority?: number;
    ipAddress?: string;
    userAgent?: string;
    io?: any;
  }): Promise<any> {
    const { command, robotId, userId, params, priority, ipAddress, userAgent, io } = payload;

    const robot = await prisma.robot.findUnique({ where: { id: robotId } });
    if (!robot) throw new NotFoundError('Robot not found');

    const commandId = uuidv4();

    // Persist command to DB immediately
    const dbCommand = await prisma.robotCommand.create({
      data: {
        id: commandId,
        robotId,
        command,
        payload: params ? JSON.stringify(params) : null,
        status: 'PENDING',
      },
    });

    await createAuditLog(
      userId,
      'USER_ROBOT_COMMAND',
      ipAddress,
      userAgent,
      `Sent command ${command} (ID: ${commandId}) to robot ${robot.name} (${robot.code})`
    );

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        this.pendingTimeouts.delete(commandId);
        eventBus.emit(RobotEvent.COMMAND_TIMEOUT, { commandId, robotId, command });

        // Update DB status
        await prisma.robotCommand.update({
          where: { id: commandId },
          data: { status: 'TIMEOUT' },
        }).catch(() => {});

        reject(new Error(`Command timeout. Robot ${robotId} failed to acknowledge ${command} within 5s`));
      }, COMMAND_TIMEOUT_MS);

      this.pendingTimeouts.set(commandId, timeoutId);

      commandQueue.enqueue({
        commandId,
        command,
        robotId,
        userId,
        params,
        priority,
        status: 'pending',
        queuedAt: new Date(),
        async resolve(value) {
          clearTimeout(timeoutId);
          await prisma.robotCommand.update({
            where: { id: commandId },
            data: { status: 'COMPLETED', executedAt: new Date() },
          }).catch(() => {});
          resolve(value);
        },
        reject(err) {
          clearTimeout(timeoutId);
          reject(err);
        },
      });

      // Send command via adapter
      this.sendViaAdapter(robotId, command, commandId, params, io).catch(async (err) => {
        clearTimeout(timeoutId);
        eventBus.emit(RobotEvent.COMMAND_FAILED, { commandId, robotId, error: err.message });

        await prisma.robotCommand.update({
          where: { id: commandId },
          data: { status: 'FAILED' },
        }).catch(() => {});

        reject(err);
      });
    });
  }

  private async sendViaAdapter(robotId: string, command: string, commandId: string, params?: any, io?: any): Promise<any> {
    try {
      const result = await adapterRegistry.sendCommand(robotId, command, commandId, params);

      // Broadcast via WebSocket
      if (io) {
        io.to(`robot:${robotId}`).emit('command:status', {
          commandId,
          command,
          robotId,
          params,
          status: result.status,
          timestamp: Date.now(),
        });
      }

      return result;
    } catch (err: any) {
      // Fallback: try sending to WebSocket room directly
      if (io) {
        io.to(`robot:${robotId}`).emit('command:send', {
          commandId,
          command,
          robotId,
          params,
          timestamp: Date.now(),
        });
        logger.info(`Command ${commandId} sent via WebSocket fallback to robot ${robotId}`);

        // Auto-ack for simulator mode after 500ms
        setTimeout(() => {
          this.handleAck(commandId, robotId, 'accepted');
        }, 500);

        return { success: true, commandId, command, robotId, status: 'accepted', message: 'Command sent via WebSocket' };
      }

      throw err;
    }
  }

  async handleAck(commandId: string, robotId: string, status: 'accepted' | 'executing' | 'completed' | 'failed' | 'timeout' | 'cancelled' = 'completed'): Promise<void> {
    const timeoutId = this.pendingTimeouts.get(commandId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.pendingTimeouts.delete(commandId);
    }

    commandQueue.handleAck(commandId, robotId);
    eventBus.emit(RobotEvent.COMMAND_ACKNOWLEDGED, { commandId, robotId, status });
    logger.info(`Command ${commandId} acknowledged by robot ${robotId} with status: ${status}`);

    // Update DB
    const dbStatus = status.toUpperCase() as any;
    if (['COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT'].includes(dbStatus)) {
      await prisma.robotCommand.update({
        where: { id: commandId },
        data: { status: dbStatus as any, executedAt: new Date() },
      }).catch(() => {});
    } else {
      await prisma.robotCommand.update({
        where: { id: commandId },
        data: { status: dbStatus as any },
      }).catch(() => {});
    }
  }

  cancelPendingCommands(robotId: string): void {
    commandQueue.cancelPending(robotId);
  }
}

export const robotCommandService = new RobotCommandService();
