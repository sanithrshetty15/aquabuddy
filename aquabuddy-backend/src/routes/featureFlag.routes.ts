import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import * as featureFlagController from '../controllers/featureFlag.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/feature-flags:
 *   get:
 *     tags: [Feature Flags]
 *     summary: List all feature flags
 *     responses:
 *       200:
 *         description: Feature flag list
 *   post:
 *     tags: [Feature Flags]
 *     summary: Create feature flag (Owner only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, name]
 *             properties:
 *               key: { type: string }
 *               name: { type: string }
 *               description: { type: string }
 *               enabled: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Feature flag created
 *
 * /api/v1/feature-flags/enabled:
 *   get:
 *     tags: [Feature Flags]
 *     summary: Get enabled feature flags (public)
 *     security: []
 *     responses:
 *       200:
 *         description: Enabled flags
 *
 * /api/v1/feature-flags/{key}:
 *   get:
 *     tags: [Feature Flags]
 *     summary: Get feature flag by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Feature flag
 *   patch:
 *     tags: [Feature Flags]
 *     summary: Update feature flag (Owner only)
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               enabled: { type: boolean }
 *               conditions: { type: object }
 *     responses:
 *       200:
 *         description: Feature flag updated
 *   delete:
 *     tags: [Feature Flags]
 *     summary: Delete feature flag (Owner only)
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Feature flag deleted
 *
 * /api/v1/feature-flags/{key}/toggle:
 *   patch:
 *     tags: [Feature Flags]
 *     summary: Toggle feature flag (Owner only)
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
 *             required: [enabled]
 *             properties:
 *               enabled: { type: boolean }
 *     responses:
 *       200:
 *         description: Feature flag toggled
 */
router.get('/enabled', featureFlagController.getEnabledFlags);
router.get('/', authenticate, featureFlagController.listFlags);
router.get('/:key', authenticate, featureFlagController.getFlag);
router.post('/', authenticate, requireRole('OWNER'), featureFlagController.createFlag);
router.patch('/:key', authenticate, requireRole('OWNER'), featureFlagController.updateFlag);
router.patch('/:key/toggle', authenticate, requireRole('OWNER'), featureFlagController.toggleFlag);
router.delete('/:key', authenticate, requireRole('OWNER'), featureFlagController.deleteFlag);

export default router;
