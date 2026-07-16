import { Request, Response, NextFunction } from 'express';
import { isProtocolVersionSupported } from '../robot/protocol';
import { logger } from '../utils/logger.utils';

export function validateProtocolVersion(req: Request, res: Response, next: NextFunction): void {
  // Check if request body is a protocol-compliant packet
  if (req.body && req.body.header && req.body.header.protocolVersion) {
    const version = req.body.header.protocolVersion;
    if (!isProtocolVersionSupported(version)) {
      logger.warn(`Unsupported protocol version: ${version} from ${req.ip}`);
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Unsupported protocol version: ${version}. Supported versions: 1.0`,
        data: null,
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }
  // If no protocol version specified, allow through (legacy support)
  next();
}
