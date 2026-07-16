import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { createAuditLog } from '../services/audit.service';
import { extractPagination, buildPaginatedResponse } from '../utils/pagination.utils';

/** GET /admin/stats — Live operations summary */
export const getLiveOpsStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalUsers, totalRobots, activeRobots, activeAlerts, totalFeedback] = await Promise.all([
      prisma.user.count(),
      prisma.robot.count(),
      prisma.robot.count({ where: { status: 'ONLINE' } }),
      prisma.alert.count({ where: { status: 'ACTIVE' } }),
      prisma.feedback.count(),
    ]);

    const recentReadings = await prisma.sensorReading.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { robot: { select: { name: true, code: true } } },
    });

    res.json({
      success: true,
      data: {
        totalUsers, totalRobots, activeRobots,
        activeAlerts, totalFeedback,
        recentReadings,
      },
    });
  } catch (error) { next(error); }
};

/** GET /admin/users — List all users */
export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, role } = req.query;
    const pagination = extractPagination(req, 'createdAt', ['createdAt', 'email', 'firstName', 'lastName', 'role']);

    const where: any = {};
    if (role && (role === 'ADMIN' || role === 'USER')) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, createdAt: true,
          _count: { select: { robots: true, feedbacks: true } },
        },
        orderBy: { [pagination.sortBy]: pagination.sortOrder },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.user.count({ where }),
    ]);

    const result = buildPaginatedResponse(users, total, pagination);
    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) { next(error); }
};

/** DELETE /admin/users/:id — Delete a user */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user?.userId || null;
    await createAuditLog(adminId, 'ADMIN_DELETE_USER', req.ip, req.headers['user-agent'] as string, `Deleted user ID: ${id}`);
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};
