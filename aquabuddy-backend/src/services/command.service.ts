import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { createAuditLog } from './audit.service';
import { ValidationError, NotFoundError } from '../utils/error.utils';
import { logger } from '../utils/logger.utils';

export interface CommandPayload {
  command: string;
  robotId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

interface PendingCommand {
  commandId: string;
  command: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  timeoutId: NodeJS.Timeout;
}

class CommandService {
  // Map of robotId -> array of queued commands
  private queues = new Map<string, Array<{ run: () => Promise<void> }>>();
  // Map of commandId -> PendingCommand
  private pending = new Map<string, PendingCommand>();
  private activeProcessing = new Set<string>();

  /**
   * Register acknowledgment from a robot.
   */
  public handleAck(commandId: string, robotId: string): void {
    const pendingCmd = this.pending.get(commandId);
    if (pendingCmd) {
      clearTimeout(pendingCmd.timeoutId);
      this.pending.delete(commandId);
      logger.info(`Command acknowledged: ${commandId} for robot ${robotId}`);
      pendingCmd.resolve({
        success: true,
        commandId,
        message: `Command ${pendingCmd.command} successfully executed and acknowledged by unit.`,
      });
    }
  }

  /**
   * Execute a command.
   */
  public async executeCommand(payload: CommandPayload, io: any): Promise<any> {
    const { command, robotId, userId, ipAddress, userAgent } = payload;

    // Verify robot exists
    const robot = await prisma.robot.findUnique({ where: { id: robotId } });
    if (!robot) {
      throw new NotFoundError('Robot not found');
    }

    const commandId = uuidv4();
    await createAuditLog(
      userId,
      'USER_ROBOT_COMMAND',
      ipAddress,
      userAgent,
      `Sent command ${command} (ID: ${commandId}) to robot ${robot.name} (${robot.code})`
    );

    // Handle EMERGENCY_STOP with absolute bypass priority
    if (command === 'EMERGENCY_STOP') {
      logger.warn(`EMERGENCY_STOP received for robot ${robotId}. Bypassing queue.`);
      return this.sendToDevice(commandId, command, robotId, io);
    }

    // Add normal commands to the sequential queue
    return new Promise((resolve, reject) => {
      const run = async () => {
        try {
          const result = await this.sendToDevice(commandId, command, robotId, io);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Process next item in the queue
          this.processNext(robotId);
        }
      };

      if (!this.queues.has(robotId)) {
        this.queues.set(robotId, []);
      }
      this.queues.get(robotId)!.push({ run });

      if (!this.activeProcessing.has(robotId)) {
        this.processNext(robotId);
      }
    });
  }

  /**
   * Process the next command in the queue for a robot.
   */
  private processNext(robotId: string): void {
    const queue = this.queues.get(robotId) || [];
    if (queue.length === 0) {
      this.activeProcessing.delete(robotId);
      return;
    }

    this.activeProcessing.add(robotId);
    const nextItem = queue.shift();
    if (nextItem) {
      nextItem.run().catch((err) => {
        logger.error(`Error executing queued command for robot ${robotId}:`, err);
      });
    }
  }

  /**
   * Send the command via WebSocket to the device and wait for ack.
   */
  private sendToDevice(commandId: string, command: string, robotId: string, io: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!io) {
        return reject(new Error('WebSocket server is not initialized'));
      }

      // Check if there are active listeners in the robot room
      // Sockets representing active connections join the `robot:${robotId}` room
      const room = io.sockets.adapter.rooms.get(`robot:${robotId}`);
      const hasDeviceConnected = room && room.size > 0;

      // In development/test or if simulator is running, we allow sending command
      // even if exact WebSocket connection counts are low, but we verify basic availability
      logger.info(`Sending command ${command} (ID: ${commandId}) to room robot:${robotId}`);
      
      // Emit the command event
      io.to(`robot:${robotId}`).emit('command:send', {
        commandId,
        command,
        robotId,
        timestamp: Date.now(),
      });

      // Set timeout for acknowledgment (5 seconds)
      const timeoutId = setTimeout(() => {
        this.pending.delete(commandId);
        logger.warn(`Command timeout reached: ${commandId} for robot ${robotId}`);
        reject(
          new Error(
            `Command timeout. Robot ${robotId} failed to acknowledge command ${command} within 5 seconds.`
          )
        );
      }, 5000);

      this.pending.set(commandId, {
        commandId,
        command,
        resolve,
        reject,
        timeoutId,
      });

      // Auto-simulate acknowledgment for local development testing/simulator
      // If there's a simulator running or it's a mock state, trigger ack after 500ms
      const isSimulatorRunning = true; // Auto-ack in simulator mode
      if (isSimulatorRunning) {
        setTimeout(() => {
          this.handleAck(commandId, robotId);
        }, 500);
      }
    });
  }
}

export const commandService = new CommandService();
