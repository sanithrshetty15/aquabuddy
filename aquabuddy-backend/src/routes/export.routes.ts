import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as exportController from '../controllers/export.controller';

const router = Router();

router.get('/robots/csv', authenticate, exportController.exportRobotsCSV);
router.get('/robots/json', authenticate, exportController.exportRobotsJSON);
router.get('/alerts/csv', authenticate, exportController.exportAlertsCSV);
router.get('/sensors/:robotId/csv', authenticate, exportController.exportSensorCSV);

export default router;
