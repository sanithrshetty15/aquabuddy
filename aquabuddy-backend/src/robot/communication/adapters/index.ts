import { BaseRobotAdapter, CommandResult, RobotConnectionState } from './base-adapter';
import { arduinoAdapter } from './arduino.adapter';
import { esp32Adapter } from './esp32.adapter';
import { logger } from '../../../utils/logger.utils';

export { BaseRobotAdapter, RobotConnectionState };
export type { CommandResult, TelemetryData, RobotStatus, HeartbeatData, AckStatus } from './base-adapter';
export { arduinoAdapter } from './arduino.adapter';
export { esp32Adapter } from './esp32.adapter';

export type AdapterType = 'arduino-serial' | 'esp32-wifi' | 'mqtt' | 'ble' | 'cellular';

class AdapterRegistry {
  private adapters = new Map<AdapterType, BaseRobotAdapter>();

  constructor() {
    this.register('arduino-serial', arduinoAdapter);
    this.register('esp32-wifi', esp32Adapter);
  }

  register(type: AdapterType, adapter: BaseRobotAdapter): void {
    this.adapters.set(type, adapter);
    logger.info(`Adapter registered: ${type} (${adapter.adapterType})`);
  }

  getAdapter(type: AdapterType): BaseRobotAdapter | undefined {
    return this.adapters.get(type);
  }

  getAllAdapters(): BaseRobotAdapter[] {
    return Array.from(this.adapters.values());
  }

  getAdapterForRobot(robotId: string): BaseRobotAdapter | undefined {
    for (const adapter of this.adapters.values()) {
      if (adapter.isConnected(robotId)) {
        return adapter;
      }
    }
    return undefined;
  }

  getConnectedRobots(): Array<{ robotId: string; adapter: string; state: RobotConnectionState }> {
    const result: Array<{ robotId: string; adapter: string; state: RobotConnectionState }> = [];
    for (const [type, adapter] of this.adapters) {
      for (const robotId of adapter.getConnectedRobots()) {
        result.push({ robotId, adapter: type, state: adapter.getConnectionState(robotId) });
      }
    }
    return result;
  }

  async sendCommand(robotId: string, command: string, commandId: string, params?: any): Promise<CommandResult> {
    const adapter = this.getAdapterForRobot(robotId);
    if (!adapter) {
      throw new Error(`No connected adapter found for robot ${robotId}`);
    }
    return adapter.sendCommand(robotId, command, commandId, params);
  }
}

export const adapterRegistry = new AdapterRegistry();
