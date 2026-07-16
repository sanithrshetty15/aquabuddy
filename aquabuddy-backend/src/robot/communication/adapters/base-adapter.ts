import { RobotPacket } from '../../protocol';

export enum RobotConnectionState {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  RECONNECTING = 'RECONNECTING',
  UNKNOWN = 'UNKNOWN',
}

export type AckStatus = 'accepted' | 'executing' | 'completed' | 'failed' | 'timeout' | 'cancelled';

export interface CommandResult {
  success: boolean;
  commandId: string;
  command: string;
  robotId: string;
  status: AckStatus;
  message?: string;
  executedAt?: Date;
}

export interface TelemetryData {
  robotId: string;
  humidity: number;
  temperature: number;
  waterFlow: number;
  waterLevel: number;
  powerConsumption: number;
  battery: number;
  voltage: number;
  current: number;
  motorStatus: string;
  pumpStatus: string;
  relayStatus: string;
  fanStatus: string;
  movementState: string;
  currentMode: string;
  obstacle: boolean;
  irDetection: boolean;
  signalStrength: number;
  runtime: number;
  firmwareVersion?: string;
  hardwareRevision?: string;
  timestamp?: Date;
}

export interface RobotStatus {
  robotId: string;
  state: RobotConnectionState;
  battery?: number;
  firmwareVersion?: string;
  hardwareVersion?: string;
  lastSeen?: Date;
  signalStrength?: number;
  healthStatus?: string;
}

export interface HeartbeatData {
  robotId: string;
  timestamp: Date;
  battery: number;
  signalStrength: number;
  firmwareVersion: string;
  connectionStatus: RobotConnectionState;
  healthStatus: string;
  uptime?: number;
}

export abstract class BaseRobotAdapter {
  public readonly adapterType: string;
  protected connections = new Map<string, RobotConnectionState>();

  constructor(adapterType: string) {
    this.adapterType = adapterType;
  }

  abstract connect(robotId: string): Promise<void>;
  abstract disconnect(robotId: string): Promise<void>;
  abstract sendCommand(robotId: string, command: string, commandId: string, params?: any): Promise<CommandResult>;
  abstract getStatus(robotId: string): Promise<RobotStatus>;
  abstract getTelemetry(robotId: string): Promise<TelemetryData | null>;

  /** Handle an incoming robot packet (protocol-aware) */
  abstract handlePacket(packet: RobotPacket): Promise<void>;

  getConnectionState(robotId: string): RobotConnectionState {
    return this.connections.get(robotId) || RobotConnectionState.UNKNOWN;
  }

  protected setConnectionState(robotId: string, state: RobotConnectionState): void {
    const previous = this.getConnectionState(robotId);
    this.connections.set(robotId, state);
    if (previous !== state) {
      this.onStateChange(robotId, state, previous);
    }
  }

  protected onStateChange(robotId: string, newState: RobotConnectionState, previousState: RobotConnectionState): void {
    // Override in subclasses
  }

  getConnectedRobots(): string[] {
    const connected: string[] = [];
    for (const [robotId, state] of this.connections) {
      if (state === RobotConnectionState.ONLINE) {
        connected.push(robotId);
      }
    }
    return connected;
  }

  isConnected(robotId: string): boolean {
    return this.getConnectionState(robotId) === RobotConnectionState.ONLINE;
  }

  abstract dispose(): Promise<void>;
}
