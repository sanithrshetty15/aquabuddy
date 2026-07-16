import prisma from '../config/database';

/**
 * Get robot locations for map display
 */
export const getRobotLocations = async (userId?: string, role?: string) => {
  const where: any = {};
  if (role !== 'ADMIN' && userId) {
    where.ownerId = userId;
  }

  const robots = await prisma.robot.findMany({
    where,
    select: {
      id: true,
      name: true,
      code: true,
      model: true,
      status: true,
      lat: true,
      lng: true,
      waterGenerated: true,
      lastUpdated: true,
      owner: { select: { firstName: true, lastName: true } },
    },
  });

  return robots.map((robot, index) => ({
    ...robot,
    lat: robot.lat || 12.9141 + (index * 0.005),
    lng: robot.lng || 74.856 + (index * 0.008),
  }));
};
