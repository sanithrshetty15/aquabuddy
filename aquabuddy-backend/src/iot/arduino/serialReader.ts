import { logger } from '../../utils/logger.utils';
import * as sensorService from '../../services/sensor.service';
import { parseArduinoCSV } from './dataParser';
import { validateArduinoData } from './validator';
import prisma from '../../config/database';

export class SerialReader {
  private isSimulated: boolean = true;
  private intervalId: NodeJS.Timeout | null = null;
  private ioServer: any = null;

  public start(io: any): void {
    this.ioServer = io;
    logger.info('Initializing Arduino IoT communication layer...');

    if (this.isSimulated) {
      logger.info('Serial Port not specified or unavailable. Starting Arduino IoT Simulator...');
      this.startSimulator();
    } else {
      logger.info('Serial Port initialized (physical device mode)');
      // In a real device setup, this is where we would listen to a physical serial port
    }
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.info('Arduino IoT communication layer stopped.');
  }

  private startSimulator(): void {
    // Generate simulated sensor readings every 10 seconds for any ACTIVE robots in database
    this.intervalId = setInterval(async () => {
      try {
        const robots = await prisma.robot.findMany({
          where: { status: 'ONLINE' }
        });

        if (robots.length === 0) {
          return;
        }

        for (const robot of robots) {
          // Generate a realistic reading
          // Base temperature: 20-35 degC, humidity: 40-80%
          const temperature = +(20 + Math.random() * 15).toFixed(1);
          const humidity = +(40 + Math.random() * 40).toFixed(1);
          // Water flow: 0.05 to 0.25 Liters per reading interval
          const waterFlow = +(0.05 + Math.random() * 0.20).toFixed(2);
          
          // Get the latest reading to aggregate waterLevel
          const latestReading = await prisma.sensorReading.findFirst({
            where: { robotId: robot.id },
            orderBy: { createdAt: 'desc' },
          });

          let currentLevel = latestReading ? latestReading.waterLevel : 0;
          currentLevel = +(currentLevel + waterFlow).toFixed(2);
          if (currentLevel > 50) {
            // Drain tank if full for testing cycle
            currentLevel = 0;
          }

          const powerConsumption = +(0.02 + Math.random() * 0.08).toFixed(3); // kWh

          // Format as CSV line to exercise our parser and validator
          const csvLine = `${robot.id},${humidity},${temperature},${waterFlow},${currentLevel},${powerConsumption}`;
          
          const parsed = parseArduinoCSV(csvLine);
          validateArduinoData(parsed);

          const result = await sensorService.ingestSensorReading(parsed);

          // Broadcast via WebSocket
          if (this.ioServer) {
            this.ioServer.to(`robot:${robot.id}`).emit('sensor:update', result.reading);
            
            // Broadcast to user dashboard room
            this.ioServer.to('dashboard:user').emit('sensor:update', result.reading);
            
            if (result.alerts.length > 0) {
              this.ioServer.to(`robot:${robot.id}`).emit('alert:new', result.alerts);
              this.ioServer.to('dashboard:user').emit('alert:new', result.alerts);
              this.ioServer.to('dashboard:admin').emit('alert:new', result.alerts);
              this.ioServer.emit('alerts:new', result.alerts); // global broadcast
            }
          }
        }
      } catch (err: any) {
        logger.error('Error in Arduino IoT Simulator loop:', { error: err.message });
      }
    }, 10000); // 10 seconds interval
  }
}

export const serialReader = new SerialReader();
