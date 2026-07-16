import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger.utils';
import { iotApiKeyAuth } from '../../middleware/iotAuth';
import { validateProtocolVersion } from '../../middleware/protocolValidator';
import { esp32Adapter } from '../../robot/communication/adapters/esp32.adapter';

const router = Router();

/**
 * POST /api/v1/iot/esp32/data
 * Direct HTTP API gateway for ESP32 devices to push sensor readings
 * Validates protocol version, then delegates to the ESP32 adapter.
 */
router.post('/data', validateProtocolVersion, iotApiKeyAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await esp32Adapter.ingestESP32Data(req.body);

    res.status(201).json({
      success: true,
      message: 'ESP32 sensor reading ingested successfully',
      data: result,
    });
  } catch (error: any) {
    logger.error('ESP32 IoT ingestion error:', { error: error.message });
    next(error);
  }
});

/**
 * GET /api/v1/iot/esp32/status
 * Health check endpoint for ESP32 device connectivity
 */
router.get('/status', iotApiKeyAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robotId = req.query.robotId as string;
    if (!robotId) {
      res.status(400).json({ success: false, message: 'robotId query parameter required' });
      return;
    }
    const status = await esp32Adapter.getStatus(robotId);
    res.json({ success: true, data: status });
  } catch (error: any) {
    next(error);
  }
});

export default router;
