import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Basic health check
 *     description: Returns service status, database connectivity, and uptime
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: OK
 *                     service:
 *                       type: string
 *                       example: AquaBuddy Backend
 *                     database:
 *                       type: string
 *                       example: connected
 *                     uptime:
 *                       type: number
 *                       example: 3600
 */
router.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.json({
    success: true,
    data: {
      status: 'OK',
      service: 'AquaBuddy Backend',
      version: '1.0.0',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
