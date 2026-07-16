export interface CreateRobotDto {
  code: string;
  name: string;
  model: string;
  lat: number;
  lng: number;
  hardwareVersion?: string;
  manufactureDate?: string;
}

export interface LinkRobotDto {
  code: string;
  name?: string;
}

export interface SendCommandDto {
  command: string;
  payload?: string;
}

export interface UpdateRobotStatusDto {
  status: 'MANUFACTURED' | 'TESTING' | 'READY' | 'ACTIVATED' | 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'FIRMWARE_UPDATE' | 'SERVICE' | 'RETIRED';
}

export interface RobotResponseDto {
  id: string;
  code: string;
  name: string;
  model: string;
  status: string;
  location: {
    lat: number;
    lng: number;
  };
  waterGenerated: number;
  battery: number;
  hardwareVersion?: string | null;
  imageUrl?: string | null;
  ownerId?: string | null;
  owner?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  activeAlerts?: any[];
  lastMaintenanceAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toRobotResponse(robot: any): RobotResponseDto {
  return {
    id: robot.id,
    code: robot.code,
    name: robot.name,
    model: robot.model,
    status: robot.status,
    location: { lat: robot.lat, lng: robot.lng },
    waterGenerated: robot.waterGenerated,
    battery: robot.battery,
    hardwareVersion: robot.hardwareVersion,
    imageUrl: robot.imageUrl,
    ownerId: robot.ownerId,
    owner: robot.owner ? {
      id: robot.owner.id,
      email: robot.owner.email,
      firstName: robot.owner.firstName,
      lastName: robot.owner.lastName,
    } : null,
    activeAlerts: robot.alerts || [],
    lastMaintenanceAt: robot.lastMaintenanceAt?.toISOString?.() || null,
    createdAt: robot.createdAt instanceof Date ? robot.createdAt.toISOString() : robot.createdAt,
    updatedAt: robot.updatedAt instanceof Date ? robot.updatedAt.toISOString() : robot.updatedAt,
  };
}
