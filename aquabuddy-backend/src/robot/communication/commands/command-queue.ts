import { logger } from '../../../utils/logger.utils';

export type CommandStatus = 'pending' | 'accepted' | 'executing' | 'completed' | 'failed' | 'timeout' | 'cancelled';

export interface QueuedCommand {
  commandId: string;
  command: string;
  robotId: string;
  userId: string;
  status: CommandStatus;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  params?: Record<string, any>;
  priority?: number;
  error?: string;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

const CONFLICTING_COMMANDS: Record<string, string[]> = {
  FORWARD: ['BACKWARD'],
  BACKWARD: ['FORWARD'],
  LEFT: ['RIGHT'],
  RIGHT: ['LEFT'],
  PUMP_ON: ['PUMP_OFF'],
  PUMP_OFF: ['PUMP_ON'],
  RELAY_ON: ['RELAY_OFF'],
  RELAY_OFF: ['RELAY_ON'],
  FAN_ON: ['FAN_OFF'],
  FAN_OFF: ['FAN_ON'],
  LIGHT_ON: ['LIGHT_OFF'],
  LIGHT_OFF: ['LIGHT_ON'],
  AUTOMATIC_MODE: ['MANUAL_MODE'],
  MANUAL_MODE: ['AUTOMATIC_MODE'],
};

const EMERGENCY_COMMANDS = ['EMERGENCY_STOP'];
const HIGH_PRIORITY_COMMANDS = ['EMERGENCY_STOP', 'STOP', 'RESTART'];

export class CommandQueue {
  private queues = new Map<string, QueuedCommand[]>();
  private activeProcessing = new Set<string>();
  private maxQueueLength = 50;

  enqueue(command: QueuedCommand): void {
    const { robotId, command: cmd } = command;

    if (!this.queues.has(robotId)) {
      this.queues.set(robotId, []);
    }

    const queue = this.queues.get(robotId)!;

    if (queue.length >= this.maxQueueLength) {
      command.status = 'cancelled';
      command.reject(new Error(`Queue full for robot ${robotId} (max ${this.maxQueueLength})`));
      return;
    }

    // Check for conflicting commands in queue
    const conflicts = this.findConflicts(queue, cmd);
    if (conflicts.length > 0) {
      command.status = 'cancelled';
      command.reject(new Error(`Command ${cmd} conflicts with queued commands: ${conflicts.join(', ')}`));
      return;
    }

    // EMERGENCY_STOP bypasses queue
    if (EMERGENCY_COMMANDS.includes(cmd)) {
      logger.warn(`EMERGENCY command ${cmd} for robot ${robotId} bypassing queue`);
      queue.unshift(command);
    } else if (HIGH_PRIORITY_COMMANDS.includes(cmd)) {
      queue.unshift(command);
    } else {
      queue.push(command);
    }

    if (!this.activeProcessing.has(robotId)) {
      this.processNext(robotId);
    }
  }

  private findConflicts(queue: QueuedCommand[], newCommand: string): string[] {
    const conflicts: string[] = [];
    const conflictingSet = CONFLICTING_COMMANDS[newCommand];
    if (!conflictingSet) return conflicts;

    for (const q of queue) {
      if (q.status !== 'pending' && q.status !== 'executing') continue;
      if (conflictingSet.includes(q.command)) {
        conflicts.push(q.command);
      }
    }
    return conflicts;
  }

  private async processNext(robotId: string): Promise<void> {
    const queue = this.queues.get(robotId);
    if (!queue || queue.length === 0) {
      this.activeProcessing.delete(robotId);
      return;
    }

    this.activeProcessing.add(robotId);
    const command = queue.shift()!;
    command.startedAt = new Date();
    command.status = 'executing';
    // Execution is handled externally via callback
  }

  handleAck(commandId: string, robotId: string): void {
    const queue = this.queues.get(robotId);
    if (!queue) return;
    this.processNext(robotId);
  }

  cancelPending(robotId: string): void {
    const queue = this.queues.get(robotId);
    if (!queue) return;

    while (queue.length > 0) {
      const cmd = queue.shift()!;
      cmd.status = 'cancelled';
      cmd.reject(new Error('Command cancelled'));
    }
  }

  getQueueLength(robotId: string): number {
    return this.queues.get(robotId)?.length || 0;
  }

  isProcessing(robotId: string): boolean {
    return this.activeProcessing.has(robotId);
  }

  clear(robotId: string): void {
    this.cancelPending(robotId);
    this.queues.delete(robotId);
    this.activeProcessing.delete(robotId);
  }
}

export const commandQueue = new CommandQueue();
