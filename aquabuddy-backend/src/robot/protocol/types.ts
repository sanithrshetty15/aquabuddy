export const PROTOCOL_VERSION = '1.0';

export enum PacketType {
  HEARTBEAT = 'heartbeat',
  TELEMETRY = 'telemetry',
  ALERT = 'alert',
  COMMAND = 'command',
  ACKNOWLEDGEMENT = 'acknowledgement',
  FIRMWARE = 'firmware',
  DIAGNOSTICS = 'diagnostics',
  MAINTENANCE = 'maintenance',
  CALIBRATION = 'calibration',
  CONFIGURATION = 'configuration',
  CAMERA = 'camera',
  GPS = 'gps',
}

export const SUPPORTED_PROTOCOL_VERSIONS = ['1.0'];

export function isProtocolVersionSupported(version: string): boolean {
  return SUPPORTED_PROTOCOL_VERSIONS.includes(version);
}
