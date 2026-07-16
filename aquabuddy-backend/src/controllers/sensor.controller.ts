import { Request, Response, NextFunction } from 'express';
import * as sensorService from '../services/sensor.service';
import { extractPagination } from '../utils/pagination.utils';

/**
 * POST /sensors/ingest
 * Ingest sensor data from IoT device
 */
export const ingestReading = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { robotId, humidity, temperature, waterFlow, waterLevel, powerConsumption } = req.body;

    const result = await sensorService.ingestSensorReading({
      robotId,
      humidity: parseFloat(humidity),
      temperature: parseFloat(temperature),
      waterFlow: parseFloat(waterFlow),
      waterLevel: parseFloat(waterLevel),
      powerConsumption: parseFloat(powerConsumption),
    });

    // Broadcast via WebSocket if available
    const io = req.app.get('io');
    if (io) {
      io.to(`robot:${robotId}`).emit('sensor:update', result.reading);
      if (result.alerts.length > 0) {
        io.to(`robot:${robotId}`).emit('alert:new', result.alerts);
        io.emit('alerts:new', result.alerts); // Broadcast to all for admin dashboard
      }
    }

    res.status(201).json({
      success: true,
      message: 'Sensor reading recorded',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /sensors/:robotId/history
 * Get sensor reading history for a robot
 */
export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robotId = req.params.robotId as string;
    const { startDate, endDate } = req.query;
    const pagination = extractPagination(req, 'createdAt', ['createdAt', 'temperature', 'humidity', 'waterFlow', 'waterLevel', 'powerConsumption']);

    const result = await sensorService.getSensorHistory({
      robotId,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      pagination,
    });

    res.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /sensors/:robotId/latest
 * Get the latest sensor reading for a robot
 */
export const getLatest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robotId = req.params.robotId as string;
    const reading = await sensorService.getLatestReading(robotId);

    res.json({
      success: true,
      data: reading,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /sensors/:robotId/stats
 * Get aggregated sensor statistics
 */
export const getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const robotId = req.params.robotId as string;
    const { hours } = req.query;

    const stats = await sensorService.getSensorStats(
      robotId,
      hours ? parseInt(hours as string) : 24
    );

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
