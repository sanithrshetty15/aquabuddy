import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AquaBuddy E-Tech API',
      version: '1.0.0',
      description: `IoT Robot Water Collection Platform

## Authentication
Most endpoints require JWT authentication via httpOnly cookie (access_token) or Bearer header.

## Roles
- **USER**: Standard user, can manage own robots
- **ADMIN**: System administrator, can manage users and robots
- **OWNER**: Platform owner, full access to all features

## Standard Response Format
\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "timestamp": "2026-01-01T00:00:00.000Z",
  "requestId": "uuid",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`
`,
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
          description: 'JWT access token stored in httpOnly cookie',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token in Authorization header',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Resource not found' },
                timestamp: { type: 'string', format: 'date-time' },
                requestId: { type: 'string', format: 'uuid' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      constraint: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 5 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'OWNER'] },
            status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Robot: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            code: { type: 'string', example: 'AQB-00001' },
            name: { type: 'string' },
            model: { type: 'string', enum: ['AQB-PRO', 'AQB-CLASSIC', 'AQB-MAX'] },
            status: { type: 'string', enum: ['MANUFACTURED', 'TESTING', 'READY', 'ACTIVATED', 'ONLINE', 'OFFLINE', 'MAINTENANCE', 'FIRMWARE_UPDATE', 'SERVICE', 'RETIRED'] },
            location: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' },
              },
            },
            waterGenerated: { type: 'number' },
            battery: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            robotId: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['TEMPERATURE_HIGH', 'HUMIDITY_LOW', 'TANK_FULL', 'SYSTEM_ERROR', 'LEAK_DETECTED'] },
            severity: { type: 'string', enum: ['INFO', 'WARNING', 'CRITICAL'] },
            message: { type: 'string' },
            status: { type: 'string', enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        SensorReading: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            robotId: { type: 'string', format: 'uuid' },
            humidity: { type: 'number' },
            temperature: { type: 'number' },
            waterFlow: { type: 'number' },
            waterLevel: { type: 'number' },
            powerConsumption: { type: 'number' },
            battery: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Firmware: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            version: { type: 'string', example: '1.1.0' },
            robotModel: { type: 'string' },
            fileUrl: { type: 'string' },
            fileSize: { type: 'integer' },
            checksum: { type: 'string' },
            status: { type: 'string', enum: ['DRAFT', 'RELEASED', 'DEPRECATED', 'ROLLED_BACK'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            priority: { type: 'string', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] },
            isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        FeatureFlag: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            enabled: { type: 'boolean' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ cookieAuth: [] }],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Robots', description: 'Robot management' },
      { name: 'Sensors', description: 'Sensor telemetry' },
      { name: 'Alerts', description: 'Alert management' },
      { name: 'Analytics', description: 'Analytics and KPIs' },
      { name: 'Predictions', description: 'Predictive analytics' },
      { name: 'Firmware', description: 'Firmware management' },
      { name: 'Service History', description: 'Robot service records' },
      { name: 'Robot Logs', description: 'Robot system logs' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Feedback', description: 'User feedback' },
      { name: 'Settings', description: 'User and platform settings' },
      { name: 'System Health', description: 'System component health' },
      { name: 'Feature Flags', description: 'Feature toggle management' },
      { name: 'Revenue', description: 'Revenue tracking' },
      { name: 'Sessions', description: 'Session management' },
      { name: 'Export', description: 'Data export endpoints' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Map', description: 'Robot location map' },
      { name: 'Audit Logs', description: 'Audit trail' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
