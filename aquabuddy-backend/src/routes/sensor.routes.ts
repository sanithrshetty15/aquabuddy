import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as sensorController from '../controllers/sensor.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/sensors/ingest:
 *   post:
 *     tags: [Sensors]
 *     summary: Ingest sensor reading from IoT device
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [robotId, humidity, temperature, waterFlow, waterLevel, powerConsumption]
 *             properties:
 *               robotId: { type: string, format: uuid }
 *               humidity: { type: number }
 *               temperature: { type: number }
 *               waterFlow: { type: number }
 *               waterLevel: { type: number }
 *               powerConsumption: { type: number }
 *               battery: { type: integer }
 *               motorStatus: { type: string }
 *               signalStrength: { type: integer }
 *     responses:
 *       201:
 *         description: Reading ingested
 *
 * /api/v1/sensors/{robotId}/history:
 *   get:
 *     tags: [Sensors]
 *     summary: Get sensor reading history
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 100 }
 *     responses:
 *       200:
 *         description: Sensor reading history
 *
 * /api/v1/sensors/{robotId}/latest:
 *   get:
 *     tags: [Sensors]
 *     summary: Get latest sensor reading
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Latest sensor reading
 *
 * /api/v1/sensors/{robotId}/stats:
 *   get:
 *     tags: [Sensors]
 *     summary: Get aggregated sensor stats
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Sensor statistics
 */

// POST /sensors/ingest — IoT devices push data
router.post('/ingest', authenticate, sensorController.ingestReading);

// GET /sensors/:robotId/history — Get sensor reading history
router.get('/:robotId/history', authenticate, sensorController.getHistory);

// GET /sensors/:robotId/latest — Get latest sensor reading
router.get('/:robotId/latest', authenticate, sensorController.getLatest);

// GET /sensors/:robotId/stats — Get aggregated stats
router.get('/:robotId/stats', authenticate, sensorController.getStats);

export default router;
