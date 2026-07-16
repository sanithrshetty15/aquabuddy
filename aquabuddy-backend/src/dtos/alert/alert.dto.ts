export interface AlertResponseDto {
  id: string;
  robotId: string;
  robot?: {
    id: string;
    name: string;
    code: string;
  };
  type: string;
  severity: string;
  message: string;
  status: string;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface AlertListQueryDto {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  robotId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function toAlertResponse(alert: any): AlertResponseDto {
  return {
    id: alert.id,
    robotId: alert.robotId,
    robot: alert.robot ? { id: alert.robot.id, name: alert.robot.name, code: alert.robot.code } : undefined,
    type: alert.type,
    severity: alert.severity,
    message: alert.message,
    status: alert.status,
    resolvedAt: alert.resolvedAt?.toISOString?.() || null,
    createdAt: alert.createdAt instanceof Date ? alert.createdAt.toISOString() : alert.createdAt,
  };
}
