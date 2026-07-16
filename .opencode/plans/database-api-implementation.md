# AquaBuddy Backend - Database & API Implementation Plan

## Audit Summary

### Existing (14 tables, functional):
User, RefreshToken, Robot, RobotCommand, MaintenanceLog, SensorReading, AnalyticsSnapshot, Prediction, Alert, Notification, Feedback, AuditLog, SystemLog

### Missing (12 new tables needed):
Session, RobotActivation, RobotAnalytics, ServiceHistory, FirmwareRecord, RobotFirmwareDeployment, RobotLog, UserSetting, PlatformSetting, SystemHealth, FeatureFlag, Revenue

### Architecture gaps:
- No Repository layer (services query Prisma directly)
- No DTOs (raw Prisma models exposed)
- No file upload/S3 integration
- No CSV/JSON exports
- No Swagger/OpenAPI docs
- No full-text search indexes
- No advanced filters (date range, severity, etc.)

---

## Phase 1: Database Schema

### File: `aquabuddy-backend/prisma/schema.prisma`

**New enums to add:**
- `FirmwareStatus` (DRAFT, RELEASED, DEPRECATED, ROLLED_BACK)
- `DeploymentStatus` (PENDING, DOWNLOADING, INSTALLING, SUCCESS, FAILED, ROLLED_BACK)
- `LogLevel` (DEBUG, INFO, WARN, ERROR, FATAL)
- `NotificationPriority` (LOW, NORMAL, HIGH, URGENT)
- `RevenueType` (SUBSCRIPTION, ONE_TIME, MAINTENANCE, FIRMWARE, OTHER)

**New models to add:**

### 1. Session (extends auth)
```
model Session {
  id             String   @id @default(uuid())
  token          String   @unique
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress      String?
  userAgent      String?
  refreshToken   String?
  expiresAt      DateTime
  lastActivityAt DateTime @default(now())
  createdAt      DateTime @default(now())
  deletedAt      DateTime?

  @@index([token])
  @@index([userId])
  @@index([expiresAt])
}
```

### 2. RobotActivation (activation codes with expiry)
```
model RobotActivation {
  id          String   @id @default(uuid())
  code        String   @unique
  robotId     String   @unique
  robot       Robot    @relation(fields: [robotId], references: [id], onDelete: Cascade)
  activatedBy String?
  activator   User?    @relation(fields: [activatedBy], references: [id], onDelete: SetNull)
  activatedAt DateTime?
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  deletedAt   DateTime?

  @@index([code])
  @@index([expiresAt])
}
```

### 3. RobotAnalytics (per-robot daily snapshots)
```
model RobotAnalytics {
  id                  String   @id @default(uuid())
  robotId             String
  robot               Robot    @relation(fields: [robotId], references: [id], onDelete: Cascade)
  date                DateTime
  totalWaterGenerated Float
  averageHumidity     Float
  averageTemperature  Float
  totalPowerConsumed  Float
  averageBattery      Float
  minBattery          Int
  maxBattery          Int
  alertCount          Int      @default(0)
  runtimeHours        Float    @default(0)
  uptimePercentage    Float    @default(100)
  createdAt           DateTime @default(now())
  deletedAt           DateTime?

  @@unique([robotId, date])
  @@index([robotId, date(sort: Desc)])
}
```

### 4. ServiceHistory (detailed service records)
```
model ServiceHistory {
  id              String    @id @default(uuid())
  robotId         String
  robot           Robot     @relation(fields: [robotId], references: [id], onDelete: Cascade)
  serviceType     String
  description     String
  performedBy     String?
  technician      User?     @relation(fields: [performedBy], references: [id], onDelete: SetNull)
  partsReplaced   String?
  cost            Float?
  notes           String?
  documentUrl     String?
  performedAt     DateTime
  nextServiceDue  DateTime?
  createdAt       DateTime  @default(now())
  deletedAt       DateTime?

  @@index([robotId, performedAt(sort: Desc)])
  @@index([robotId, serviceType])
}
```

### 5. FirmwareRecord (firmware metadata and binaries)
```
model FirmwareRecord {
  id            String        @id @default(uuid())
  version       String
  robotModel    String
  fileUrl       String
  fileSize      Int
  checksum      String
  changelog     String?
  status        FirmwareStatus @default(DRAFT)
  uploadedBy    String?
  uploader      User?         @relation(fields: [uploadedBy], references: [id], onDelete: SetNull)
  minHardwareVersion String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  deletedAt     DateTime?

  deployments   RobotFirmwareDeployment[]

  @@unique([version, robotModel])
  @@index([status])
  @@index([robotModel, status])
}
```

### 6. RobotFirmwareDeployment (deployment tracking - join table)
```
model RobotFirmwareDeployment {
  id            String           @id @default(uuid())
  robotId       String
  robot         Robot            @relation(fields: [robotId], references: [id], onDelete: Cascade)
  firmwareId    String
  firmware      FirmwareRecord   @relation(fields: [firmwareId], references: [id], onDelete: Restrict)
  status        DeploymentStatus @default(PENDING)
  errorMessage  String?
  deployedAt    DateTime?
  completedAt   DateTime?
  createdAt     DateTime         @default(now())
  deletedAt     DateTime?

  @@unique([robotId, firmwareId])
  @@index([robotId, status])
  @@index([firmwareId, status])
}
```

### 7. RobotLog (robot-specific system/error logs)
```
model RobotLog {
  id        String    @id @default(uuid())
  robotId   String
  robot     Robot     @relation(fields: [robotId], references: [id], onDelete: Cascade)
  level     LogLevel  @default(INFO)
  message   String
  meta      String?
  source    String?   @default("system")
  createdAt DateTime  @default(now())
  deletedAt DateTime?

  @@index([robotId, createdAt(sort: Desc)])
  @@index([level, createdAt(sort: Desc)])
}
```

### 8. UserSetting (user preferences)
```
model UserSetting {
  id         String   @id @default(uuid())
  userId     String   @unique
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  preferences Json?   @default("{}")
  notifications Json? @default("{}")
  privacy     Json?   @default("{}")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deletedAt  DateTime?
}
```

### 9. PlatformSetting (global platform settings)
```
model PlatformSetting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       Json
  type        String   @default("string")
  description String?
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  @@index([key])
  @@index([isPublic])
}
```

### 10. SystemHealth (health check records)
```
model SystemHealth {
  id          String   @id @default(uuid())
  component   String
  status      String
  message     String?
  latencyMs   Int?
  checkedAt   DateTime @default(now())
  createdAt   DateTime @default(now())
  deletedAt   DateTime?

  @@index([component, checkedAt(sort: Desc)])
  @@index([component, status])
}
```

### 11. FeatureFlag (feature toggles)
```
model FeatureFlag {
  id          String   @id @default(uuid())
  key         String   @unique
  enabled     Boolean  @default(false)
  name        String
  description String?
  conditions  Json?    @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  @@index([key])
  @@index([enabled])
}
```

### 12. Revenue (MVP revenue tracking)
```
model Revenue {
  id          String       @id @default(uuid())
  type        RevenueType  @default(OTHER)
  description String
  amount      Float
  currency    String       @default("USD")
  referenceId String?
  referenceType String?
  date        DateTime     @default(now())
  metadata    Json?        @default("{}")
  createdAt   DateTime     @default(now())
  deletedAt   DateTime?

  @@index([date(sort: Desc)])
  @@index([type])
  @@index([referenceType, referenceId])
}
```

**Enhancements to existing models:**

### Robot (add fields)
```diff
+ imageUrl          String?
+ lastMaintenanceAt DateTime?
```

### Notification (add fields)
```diff
+ priority  NotificationPriority @default(NORMAL)
+ readAt    DateTime?
```

### AnalyticsSnapshot (add fields)
```diff
+ newUsers      Int      @default(0)
+ totalRevenue  Float    @default(0)
```

### AuditLog (add fields)
```diff
+ resource   String?
+ resourceId String?
```

---

## Phase 2: Migration & Seed

### Commands:
```bash
cd aquabuddy-backend
npx prisma migrate dev --name add_session_robot_analytics_firmware_settings_health_revenue
npx prisma generate
```

### Seed updates (`prisma/seed.ts`):
- Add 2 Sessions for Owner and Admin users
- Add 3 RobotActivation records (1 per robot)
- Add RobotAnalytics: 7 days x 3 robots
- Add RobotLog: 10 sample logs per robot
- Add ServiceHistory: 2 service records per robot
- Add FirmwareRecord: 3 versions
- Add UserSetting: 1 per user
- Add PlatformSetting: 5 defaults (site name, maintenance mode, etc.)
- Add SystemHealth: 5 component checks
- Add FeatureFlag: 5 flags (dashboard_v2, ai_chat, remote_control, etc.)
- Add Revenue: 5 sample records

---

## Phase 3: Repository Layer

### Create `src/repositories/` directory structure:
```
src/repositories/
  base.repository.ts        # Base CRUD with soft-delete awareness
  user.repository.ts
  robot.repository.ts
  session.repository.ts
  robotActivation.repository.ts
  sensor.repository.ts
  alert.repository.ts
  robotAnalytics.repository.ts
  serviceHistory.repository.ts
  firmware.repository.ts
  robotLog.repository.ts
  notification.repository.ts
  feedback.repository.ts
  auditLog.repository.ts
  settings.repository.ts
  systemHealth.repository.ts
  featureFlag.repository.ts
  revenue.repository.ts
```

### Base Repository Pattern:
```typescript
// base.repository.ts
export class BaseRepository<T, CreateInput, UpdateInput> {
  constructor(private model: PrismaDelegate) {}

  async findById(id: string): Promise<T | null> {
    return this.model.findFirst({ where: { id, deletedAt: null } });
  }

  async findMany(params: QueryParams): Promise<PaginatedResult<T>> { ... }
  async create(data: CreateInput): Promise<T> { ... }
  async update(id: string, data: UpdateInput): Promise<T> { ... }
  async softDelete(id: string): Promise<T> { ... }
  async hardDelete(id: string): Promise<T> { ... }  // admin only
}
```

Refactor all 13 existing services to use repositories instead of `prisma.xyz` directly.

---

## Phase 4: DTO Layer

### Create `src/dtos/` directory structure:
```
src/dtos/
  index.ts                  # Re-exports
  user/
    user.dto.ts
    create-user.dto.ts
    update-user.dto.ts
    user-response.dto.ts
  robot/
    robot.dto.ts
    create-robot.dto.ts
    link-robot.dto.ts
    robot-response.dto.ts
  sensor/
    sensor-reading.dto.ts
    sensor-response.dto.ts
  alert/
    alert.dto.ts
    alert-response.dto.ts
  auth/
    login.dto.ts
    register.dto.ts
    auth-response.dto.ts
  notification/
    notification.dto.ts
    notification-response.dto.ts
  feedback/
    feedback.dto.ts
    feedback-response.dto.ts
  firmware/
    firmware.dto.ts
    firmware-response.dto.ts
    deploy-firmware.dto.ts
  settings/
    settings.dto.ts
    settings-response.dto.ts
  feature-flag/
    feature-flag.dto.ts
    feature-flag-response.dto.ts
  revenue/
    revenue.dto.ts
    revenue-response.dto.ts
  common/
    pagination.dto.ts
    api-response.dto.ts
    error-response.dto.ts
```

### Standard API Response DTO:
```typescript
interface StandardApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;           // ISO 8601
  requestId: string;           // UUID
  pagination?: PaginationMeta; // if paginated
  errors?: ValidationError[];  // if validation errors
}
```

### Transform function to strip Prisma internals:
```typescript
function toRobotResponse(prismaRobot: Robot): RobotResponseDTO {
  return {
    id: prismaRobot.id,
    code: prismaRobot.code,
    name: prismaRobot.name,
    model: prismaRobot.model,
    status: prismaRobot.status,
    location: { lat: prismaRobot.lat, lng: prismaRobot.lng },
    waterGenerated: prismaRobot.waterGenerated,
    battery: prismaRobot.battery,
    hardwareVersion: prismaRobot.hardwareVersion,
    ownerId: prismaRobot.ownerId,
    createdAt: prismaRobot.createdAt.toISOString(),
    updatedAt: prismaRobot.updatedAt.toISOString(),
    // NEVER expose: deletedAt, internal fields
  };
}
```

---

## Phase 5: New API Modules

### New routes (prefix: `/api/v1`):

| Module | Endpoints | Method | Auth |
|--------|-----------|--------|------|
| **Sessions** | `/sessions/me` | GET | User |
| | `/sessions/me` | DELETE | User |
| | `/sessions` | GET | Admin |
| | `/sessions/:id` | DELETE | Admin |
| **Robot Activation** | `/robots/:id/activation` | GET | User |
| | `/robots/:id/activate` | POST | User |
| **Robot Analytics** | `/robots/:id/analytics` | GET | User |
| | `/robots/:id/analytics/summary` | GET | User |
| **Service History** | `/robots/:id/service-history` | GET | User |
| | `/robots/:id/service-history` | POST | Admin |
| | `/service-history/:id` | PATCH | Admin |
| **Firmware** | `/firmware` | GET | User |
| | `/firmware` | POST | Admin |
| | `/firmware/:id/deploy` | POST | Admin |
| | `/firmware/deployments/:id` | PATCH | Admin |
| | `/robots/:id/firmware` | GET | User |
| | `/firmware/:id` | GET | User |
| **Robot Logs** | `/robots/:id/logs` | GET | User |
| | `/robots/:id/logs` | POST | System |
| **Settings** | `/settings/user` | GET | User |
| | `/settings/user` | PUT | User |
| | `/settings/platform` | GET | Admin |
| | `/settings/platform` | PUT | Owner |
| | `/settings/platform/:key` | GET | Admin |
| **System Health** | `/health` | GET | Public |
| | `/health/detailed` | GET | Admin |
| | `/health/components` | GET | Admin |
| **Feature Flags** | `/feature-flags` | GET | Public |
| | `/feature-flags/:key` | GET | Public |
| | `/feature-flags` | POST | Owner |
| | `/feature-flags/:key` | PATCH | Owner |
| **Revenue** | `/revenue` | GET | Admin |
| | `/revenue/summary` | GET | Admin |
| | `/revenue` | POST | System |
| **Notifications** | `/notifications` | GET | User |
| | `/notifications/:id/read` | PATCH | User |
| | `/notifications/read-all` | POST | User |
| | `/notifications` | POST | System |
| **Exports** | `/export/robots/csv` | GET | User |
| | `/export/robots/json` | GET | User |
| | `/export/alerts/csv` | GET | User |
| | `/export/sensors/:robotId/csv` | GET | User |
| **File Upload** | `/upload/firmware` | POST | Admin |
| | `/upload/robot-image` | POST | User |
| | `/upload/service-document` | POST | Admin |

### Module structure (per module):
```
src/
  controllers/
    firmware.controller.ts
    serviceHistory.controller.ts
    robotLog.controller.ts
    settings.controller.ts
    systemHealth.controller.ts
    featureFlag.controller.ts
    revenue.controller.ts
    session.controller.ts
    robotAnalytics.controller.ts
    notification.controller.ts
    export.controller.ts
    upload.controller.ts
  services/
    firmware.service.ts
    serviceHistory.service.ts
    robotLog.service.ts
    settings.service.ts
    systemHealth.service.ts
    featureFlag.service.ts
    revenue.service.ts
    session.service.ts
    robotAnalytics.service.ts
    notification.service.ts (enhance existing)
    export.service.ts
    upload.service.ts
  routes/
    firmware.routes.ts
    serviceHistory.routes.ts
    robotLog.routes.ts
    settings.routes.ts
    systemHealth.routes.ts
    featureFlag.routes.ts
    revenue.routes.ts
    session.routes.ts
    robotAnalytics.routes.ts
    notification.routes.ts (enhance existing)
    export.routes.ts
    upload.routes.ts
  validators/
    firmware.validator.ts
    serviceHistory.validator.ts
    robotLog.validator.ts
    settings.validator.ts
    featureFlag.validator.ts
    revenue.validator.ts
    session.validator.ts
    robotAnalytics.validator.ts
    export.validator.ts
    upload.validator.ts
```

### Standard response middleware:

```typescript
// Update src/types/api.types.ts
export interface StandardApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
  errors?: ValidationErrorDetail[];
}
```

---

## Phase 6: API Documentation

### Install:
```bash
npm install swagger-jsdoc swagger-ui-express
npm install -D @types/swagger-jsdoc @types/swagger-ui-express
```

### Create `src/config/swagger.ts`:
```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AquaBuddy E-Tech API',
      version: '1.0.0',
      description: 'IoT Robot Water Collection Platform',
    },
    servers: [
      { url: '/api/v1', description: 'API v1' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: { /* generated from DTOs */ },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/dtos/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

### Add Swagger UI to `src/app.ts`:
```typescript
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/v1/docs.json', (_req, res) => res.json(swaggerSpec));
```

### Endpoints documentation with JSDoc annotations:
```typescript
/**
 * @openapi
 * /robots:
 *   get:
 *     tags: [Robots]
 *     summary: List all robots for current user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVE, INACTIVE, MAINTENANCE, ERROR] }
 *     responses:
 *       200:
 *         description: Paginated list of robots
 */
```

### Generate Postman Collection:
```typescript
// scripts/generate-postman.ts
// Uses swagger spec to export Postman collection v2.1 JSON
```

---

## Implementation Order

1. **schema.prisma** — Write complete file with all 26 models + enums
2. **`prisma migrate dev`** — Generate migration
3. **`prisma/seed.ts`** — Update with new models
4. **`src/repositories/`** — Create base + all entity repositories
5. **`src/dtos/`** — Create all DTOs + response transformers
6. **`src/services/`** — Refactor existing + create new services
7. **`src/controllers/`** — Create new controllers; update existing to use DTOs
8. **`src/routes/`** — Create new routes; register in `app.ts`
9. **`src/validators/`** — Create Zod schemas for new endpoints
10. **`src/config/swagger.ts`** — Setup OpenAPI + annotate routes
11. **`scripts/generate-postman.ts`** — Postman collection generator
12. **Test & verify** — `npm run build` and manual endpoint tests
