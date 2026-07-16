import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as firmwareController from '../controllers/firmware.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/firmware:
 *   get:
 *     tags: [Firmware]
 *     summary: List firmware records
 *     parameters:
 *       - in: query
 *         name: robotModel
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Firmware list
 *   post:
 *     tags: [Firmware]
 *     summary: Create firmware record (Admin/Owner)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [version, robotModel, fileUrl, fileSize, checksum]
 *             properties:
 *               version: { type: string }
 *               robotModel: { type: string }
 *               fileUrl: { type: string }
 *               fileSize: { type: integer }
 *               checksum: { type: string }
 *               changelog: { type: string }
 *     responses:
 *       201:
 *         description: Firmware created
 *
 * /api/v1/firmware/deploy:
 *   post:
 *     tags: [Firmware]
 *     summary: Deploy firmware to robot (Admin/Owner)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [robotId, firmwareId]
 *             properties:
 *               robotId: { type: string, format: uuid }
 *               firmwareId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Firmware deployment created
 *
 * /api/v1/firmware/deployments/robot/{robotId}:
 *   get:
 *     tags: [Firmware]
 *     summary: Get firmware deployments for a robot
 *     parameters:
 *       - in: path
 *         name: robotId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Deployment list
 *
 * /api/v1/firmware/deployments/{id}:
 *   patch:
 *     tags: [Firmware]
 *     summary: Update deployment status (Admin/Owner)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, DOWNLOADING, INSTALLING, SUCCESS, FAILED, ROLLED_BACK]
 *               errorMessage: { type: string }
 *     responses:
 *       200:
 *         description: Deployment updated
 *
 * /api/v1/firmware/model/{robotModel}/latest:
 *   get:
 *     tags: [Firmware]
 *     summary: Get latest firmware for a model
 *     parameters:
 *       - in: path
 *         name: robotModel
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Latest firmware
 */
router.get('/', authenticate, firmwareController.listFirmware);
router.get('/:id', authenticate, firmwareController.getFirmware);
router.post('/', authenticate, requireRole('ADMIN', 'OWNER'), firmwareController.createFirmware);
router.get('/model/:robotModel/latest', authenticate, firmwareController.getLatestForModel);
router.post('/deploy', authenticate, requireRole('ADMIN', 'OWNER'), firmwareController.deployFirmware);
router.get('/deployments/robot/:robotId', authenticate, firmwareController.getRobotDeployments);
router.patch('/deployments/:id', authenticate, requireRole('ADMIN', 'OWNER'), firmwareController.updateDeployment);

export default router;
