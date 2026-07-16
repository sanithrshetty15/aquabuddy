import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as settingsController from '../controllers/settings.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/settings/user:
 *   get:
 *     tags: [Settings]
 *     summary: Get current user settings
 *     responses:
 *       200:
 *         description: User settings
 *   put:
 *     tags: [Settings]
 *     summary: Update current user settings
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences: { type: object }
 *               notifications: { type: object }
 *               privacy: { type: object }
 *     responses:
 *       200:
 *         description: Settings updated
 *
 * /api/v1/settings/platform:
 *   get:
 *     tags: [Settings]
 *     summary: Get platform settings (Admin/Owner)
 *     responses:
 *       200:
 *         description: Platform settings
 *   post:
 *     tags: [Settings]
 *     summary: Create platform setting (Owner only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, value]
 *             properties:
 *               key: { type: string }
 *               value: {}
 *               type: { type: string }
 *               description: { type: string }
 *               isPublic: { type: boolean }
 *     responses:
 *       201:
 *         description: Platform setting created
 *
 * /api/v1/settings/platform/public:
 *   get:
 *     tags: [Settings]
 *     summary: Get public platform settings
 *     security: []
 *     responses:
 *       200:
 *         description: Public settings
 *
 * /api/v1/settings/platform/{key}:
 *   get:
 *     tags: [Settings]
 *     summary: Get platform setting by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Platform setting
 *   put:
 *     tags: [Settings]
 *     summary: Update platform setting (Owner only)
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value: {}
 *               description: { type: string }
 *               isPublic: { type: boolean }
 *     responses:
 *       200:
 *         description: Platform setting updated
 *   delete:
 *     tags: [Settings]
 *     summary: Delete platform setting (Owner only)
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Platform setting deleted
 */
router.get('/user', authenticate, settingsController.getUserSettings);
router.put('/user', authenticate, settingsController.updateUserSettings);
router.get('/platform/public', settingsController.getPublicSettings);
router.get('/platform', authenticate, requireRole('ADMIN', 'OWNER'), settingsController.getPlatformSettings);
router.get('/platform/:key', authenticate, settingsController.getPlatformSettingByKey);
router.put('/platform/:key', authenticate, requireRole('OWNER'), settingsController.updatePlatformSetting);
router.post('/platform', authenticate, requireRole('OWNER'), settingsController.createPlatformSetting);
router.delete('/platform/:key', authenticate, requireRole('OWNER'), settingsController.deletePlatformSetting);

export default router;
