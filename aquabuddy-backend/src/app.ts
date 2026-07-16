import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middleware/cors';
import { globalRateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { API_PREFIX } from './utils/constants';
import { env } from './config/env';
import { sanitizeInput } from './middleware/sanitizer';
import { csrfProtection } from './middleware/csrf';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Routes
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import robotRoutes from './routes/robot.routes';

import sensorRoutes from './routes/sensor.routes';
import esp32Router from './iot/esp32/apiGateway';
import alertsRoutes from './routes/alerts.routes';
import analyticsRoutes from './routes/analytics.routes';
import predictionRoutes from './routes/prediction.routes';
import feedbackRoutes from './routes/feedback.routes';
import mapRoutes from './routes/map.routes';
import adminRoutes from './routes/admin.routes';

// New Modules
import firmwareRoutes from './routes/firmware.routes';
import serviceHistoryRoutes from './routes/serviceHistory.routes';
import robotLogRoutes from './routes/robotLog.routes';
import settingsRoutes from './routes/settings.routes';
import systemHealthRoutes from './routes/systemHealth.routes';
import featureFlagRoutes from './routes/featureFlag.routes';
import revenueRoutes from './routes/revenue.routes';
import sessionRoutes from './routes/session.routes';
import robotAnalyticsRoutes from './routes/robotAnalytics.routes';
import notificationRoutes from './routes/notification.routes';
import exportRoutes from './routes/export.routes';

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org", "https://*.openstreetmap.org"],
        connectSrc: ["'self'", "ws:", "wss:", env.FRONTEND_URL],
        upgradeInsecureRequests: [],
      },
    } : undefined, // default permissive CSP for development to make debugging easier
  })
);

// Force HTTPS in production
app.use((req, res, next) => {
  if (env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

app.use(corsMiddleware);
app.use(cookieParser(env.COOKIE_SECRET));

// ─── Parsing ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Sanitization ────────────────────────────────────────────
app.use(sanitizeInput);

// ─── Logging ─────────────────────────────────────────────────
app.use(requestLogger);

// ─── Rate Limiting ───────────────────────────────────────────
app.use(globalRateLimiter);

// ─── API Documentation ───────────────────────────────────────
app.use(`${API_PREFIX}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'AquaBuddy API Docs',
  customfavIcon: '/favicon.ico',
  swaggerOptions: { persistAuthorization: true },
}));
app.get(`${API_PREFIX}/docs.json`, (_req, res) => res.json(swaggerSpec));

// ─── CSRF Protection ─────────────────────────────────────────
app.use(csrfProtection);

// ─── API Routes ──────────────────────────────────────────────
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/robots`, robotRoutes);

app.use(`${API_PREFIX}/sensors`, sensorRoutes);
app.use(`${API_PREFIX}/iot/esp32`, esp32Router);
app.use(`${API_PREFIX}/alerts`, alertsRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/predictions`, predictionRoutes);
app.use(`${API_PREFIX}/feedback`, feedbackRoutes);
app.use(`${API_PREFIX}/map`, mapRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// ─── New Module Routes ────────────────────────────────────────
app.use(`${API_PREFIX}/firmware`, firmwareRoutes);
app.use(`${API_PREFIX}/service-history`, serviceHistoryRoutes);
app.use(`${API_PREFIX}/robot-logs`, robotLogRoutes);
app.use(`${API_PREFIX}/settings`, settingsRoutes);
app.use(`${API_PREFIX}/system-health`, systemHealthRoutes);
app.use(`${API_PREFIX}/feature-flags`, featureFlagRoutes);
app.use(`${API_PREFIX}/revenue`, revenueRoutes);
app.use(`${API_PREFIX}/sessions`, sessionRoutes);
app.use(`${API_PREFIX}/robot-analytics`, robotAnalyticsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/export`, exportRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist',
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

export default app;
