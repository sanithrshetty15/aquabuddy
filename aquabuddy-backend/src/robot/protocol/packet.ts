import { PacketType, PROTOCOL_VERSION } from './types';

export interface RobotPacketHeader {
  protocolVersion: string;
  firmwareVersion: string;
  hardwareVersion: string;
  robotId: string;
  packetType: PacketType;
  timestamp: number;
  checksum: string;
}

export interface RobotPacket<T = Record<string, any>> {
  header: RobotPacketHeader;
  payload: T;
}

export function createPacket<T>(
  robotId: string,
  packetType: PacketType,
  payload: T,
  meta?: { firmwareVersion?: string; hardwareVersion?: string }
): RobotPacket<T> {
  const header: RobotPacketHeader = {
    protocolVersion: PROTOCOL_VERSION,
    firmwareVersion: meta?.firmwareVersion || '1.0.0',
    hardwareVersion: meta?.hardwareVersion || 'v1.0',
    robotId,
    packetType,
    timestamp: Date.now(),
    checksum: '',
  };

  header.checksum = computeChecksum({ header, payload });
  return { header, payload };
}

export function computeChecksum(data: any): string {
  const crypto = require('crypto');
  const str = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(str).digest('hex');
}

export function verifyChecksum(packet: RobotPacket): boolean {
  const expected = packet.header.checksum;
  const computed = computeChecksum({
    header: { ...packet.header, checksum: '' },
    payload: packet.payload,
  });
  return expected === computed;
}

export function validatePacket<T extends Record<string, any>>(packet: RobotPacket<T>): string[] {
  const errors: string[] = [];

  if (!packet.header) return ['Missing packet header'];

  const { header } = packet;

  if (!header.protocolVersion) errors.push('Missing protocolVersion');
  if (!header.robotId) errors.push('Missing robotId');
  if (!header.packetType) errors.push('Missing packetType');
  if (!header.timestamp) errors.push('Missing timestamp');
  if (!header.checksum) errors.push('Missing checksum');

  try {
    if (!verifyChecksum(packet)) errors.push('Checksum mismatch');
  } catch {
    errors.push('Checksum verification failed');
  }

  return errors;
}
