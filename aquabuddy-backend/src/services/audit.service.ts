import { prisma } from '../config/database';
import { logger } from '../utils/logger.utils';

export const createAuditLog = async (
  userId: string | null,
  action: string,
  ipAddress?: string,
  userAgent?: string,
  details?: string
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        details,
      },
    });
  } catch (error) {
    logger.error('Failed to write audit log:', error);
  }
};
