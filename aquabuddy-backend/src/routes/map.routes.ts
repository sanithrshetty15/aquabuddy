import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as mapController from '../controllers/map.controller';

const router = Router();

router.get('/robots', authenticate, mapController.getRobotLocations);

export default router;
