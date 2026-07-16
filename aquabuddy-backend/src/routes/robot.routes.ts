import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/inputValidator';
import { authenticate } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/rbac.middleware';
import { activationRateLimiter, commandRateLimiter } from '../middleware/rateLimiter';
import { listRobots, robotDetails, addRobot, changeRobotStatus, linkRobot, sendRobotCommand } from '../controllers/robot.controller';
import { RobotStatus } from '@prisma/client';

const router = Router();

/**
 * @openapi
 * /api/v1/robots:
 *   get:
 *     tags: [Robots]
 *     summary: List user's robots
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, INACTIVE, MAINTENANCE, ERROR] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of robots
 *   post:
 *     tags: [Robots]
 *     summary: Create robot (Admin only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, model, lat, lng]
 *             properties:
 *               code: { type: string }
 *               name: { type: string }
 *               model: { type: string }
 *               lat: { type: number }
 *               lng: { type: number }
 *     responses:
 *       201:
 *         description: Robot created
 *
 * /api/v1/robots/link:
 *   post:
 *     tags: [Robots]
 *     summary: Link robot to account via activation code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string }
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: Robot linked successfully
 *
 * /api/v1/robots/{id}:
 *   get:
 *     tags: [Robots]
 *     summary: Get robot details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Robot details
 *
 * /api/v1/robots/{id}/command:
 *   post:
 *     tags: [Robots]
 *     summary: Send command to robot
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [command]
 *             properties:
 *               command:
 *                 type: string
 *                 enum: [FORWARD, BACKWARD, LEFT, RIGHT, STOP, EMERGENCY_STOP, PUMP_ON, PUMP_OFF]
 *     responses:
 *       200:
 *         description: Command sent
 *
 * /api/v1/robots/{id}/status:
 *   patch:
 *     tags: [Robots]
 *     summary: Update robot status (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE, ERROR]
 *     responses:
 *       200:
 *         description: Status updated
 */

const linkRobotSchema = z.object({
  code: z.string().min(1, 'Robot code is required'),
  name: z.string().min(1, 'Robot name cannot be empty').optional(),
});

const createRobotSchema = z.object({
  code: z.string().min(1, 'Robot code is required'),
  name: z.string().min(1, 'Robot name is required'),
  model: z.string().min(1, 'Robot model is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const changeStatusSchema = z.object({
  status: z.nativeEnum(RobotStatus),
});

const commandSchema = z.object({
  command: z.enum([
    'FORWARD',
    'BACKWARD',
    'LEFT',
    'RIGHT',
    'STOP',
    'EMERGENCY_STOP',
    'PUMP_ON',
    'PUMP_OFF',
    'RELAY_ON',
    'RELAY_OFF',
    'FAN_ON',
    'FAN_OFF',
    'LIGHT_ON',
    'LIGHT_OFF'
  ], {
    errorMap: () => ({ message: 'Invalid command type' })
  }),
});

router.get('/', authenticate, listRobots);
router.get('/:id', authenticate, robotDetails);
router.post('/link', authenticate, activationRateLimiter, validate(linkRobotSchema), linkRobot);
router.post('/:id/command', authenticate, commandRateLimiter, validate(commandSchema), sendRobotCommand);

// Admin-only endpoints
router.post('/', authenticate, adminOnly, validate(createRobotSchema), addRobot);
router.patch('/:id/status', authenticate, adminOnly, validate(changeStatusSchema), changeRobotStatus);

export default router;
