import { prisma } from '../config/database';
import { NotFoundError, ConflictError, ValidationError } from '../utils/error.utils';
import { RobotStatus } from '@prisma/client';
import { PaginationParams, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.utils';
import { lifecycleService } from './lifecycle.service';

export interface RobotListQuery {
  userId?: string;
  isAdmin?: boolean;
  search?: string;
  status?: string;
  pagination: PaginationParams;
}

export const getRobots = async (query: RobotListQuery): Promise<PaginatedResponse<any>> => {
  const { userId, isAdmin, search, status, pagination } = query;
  const where: any = {};

  if (!isAdmin && userId) {
    where.ownerId = userId;
  }

  if (status && Object.values(RobotStatus).includes(status as RobotStatus)) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.robot.findMany({
      where,
      include: isAdmin
        ? { owner: { select: { id: true, email: true, firstName: true, lastName: true } } }
        : undefined,
      orderBy: { [pagination.sortBy]: pagination.sortOrder },
      skip: pagination.skip,
      take: pagination.limit,
    }),
    prisma.robot.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, pagination);
};

export const getRobotById = async (id: string, userId?: string, isAdmin: boolean = false) => {
  const robot = await prisma.robot.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
      alerts: { where: { status: 'ACTIVE' } },
    },
  });

  if (!robot) {
    throw new NotFoundError('Robot not found');
  }

  if (!isAdmin && robot.ownerId !== userId) {
    throw new ValidationError('Access denied to this robot');
  }

  return robot;
};

export const createRobot = async (data: {
  code: string;
  name: string;
  model: string;
  lat: number;
  lng: number;
  hardwareVersion?: string;
  manufactureDate?: string;
  manufacturingBatch?: string;
  factoryOperator?: string;
  productionLocation?: string;
}) => {
  const existing = await prisma.robot.findUnique({ where: { code: data.code } });
  if (existing) {
    throw new ConflictError('Robot with this code already exists');
  }

  return prisma.robot.create({
    data: {
      code: data.code,
      name: data.name,
      model: data.model,
      lat: data.lat,
      lng: data.lng,
      status: RobotStatus.MANUFACTURED,
      hardwareVersion: data.hardwareVersion,
      manufacturingBatch: data.manufacturingBatch,
      factoryOperator: data.factoryOperator,
      productionLocation: data.productionLocation,
      manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : undefined,
    },
  });
};

export const updateRobotStatus = async (id: string, status: RobotStatus, options?: { triggeredBy?: string; reason?: string }) => {
  return lifecycleService.transition(id, status, options);
};

export const linkRobotToOwner = async (userId: string, code: string, robotName?: string) => {
  const robot = await prisma.robot.findUnique({ where: { code } });
  if (!robot) {
    throw new NotFoundError('Invalid robot activation code. Robot not found.');
  }

  if (robot.ownerId) {
    throw new ConflictError('This robot is already linked to an account.');
  }

  const [updated] = await Promise.all([
    prisma.robot.update({
      where: { id: robot.id },
      data: {
        ownerId: userId,
        status: RobotStatus.ACTIVATED,
        name: robotName || robot.name,
        lastUpdated: new Date(),
      },
    }),
    prisma.robotActivation.create({
      data: {
        code,
        robotId: robot.id,
        activatedBy: userId,
        activatedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  await lifecycleService.transition(robot.id, RobotStatus.ACTIVATED, {
    triggeredBy: userId,
    reason: 'User activation via code',
  }).catch(() => {});

  return updated;
};

export const retireRobot = async (id: string, triggeredBy?: string, reason?: string) => {
  return lifecycleService.transition(id, RobotStatus.RETIRED, { triggeredBy, reason: reason || 'Robot retired' });
};

export const markOnline = async (id: string, triggeredBy?: string) => {
  return lifecycleService.transition(id, RobotStatus.ONLINE, { triggeredBy, reason: 'Robot connected' });
};

export const markOffline = async (id: string, triggeredBy?: string, reason?: string) => {
  return lifecycleService.transition(id, RobotStatus.OFFLINE, { triggeredBy, reason: reason || 'Robot disconnected' });
};
