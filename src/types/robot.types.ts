import { User } from './user.types';

export type RobotStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'ERROR';
export type PurchaseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Robot {
  id: string;
  code: string;
  name: string;
  model: string;
  status: RobotStatus;
  lat: number;
  lng: number;
  ownerId?: string | null;
  owner?: User | null;
  waterGenerated: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequest {
  id: string;
  userId: string;
  user?: User;
  robotModel: string;
  quantity: number;
  status: PurchaseStatus;
  rejectionReason?: string | null;
  generatedCode?: string | null;
  createdAt: string;
  updatedAt: string;
}
