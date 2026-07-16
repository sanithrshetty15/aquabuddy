import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  MAX_FILE_SIZE: z.coerce.number().default(5242880),
  UPLOAD_DIR: z.string().default('uploads'),

  // Security: CORS origins (comma-separated list)
  ALLOWED_ORIGINS: z.string().default(''),

  // Security: Cookie-based auth
  COOKIE_SECRET: z.string().min(10).default('aquabuddy-cookie-secret-change-in-prod'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  COOKIE_SECURE: z.coerce.boolean().default(false),

  // Security: CSRF
  CSRF_SECRET: z.string().min(10).default('aquabuddy-csrf-secret-change-in-prod'),

  // Security: IoT API Key
  IOT_API_KEY: z.string().default(''),

  // Security: Login attempt protection
  LOGIN_MAX_ATTEMPTS: z.coerce.number().default(5),
  LOGIN_LOCKOUT_DURATION_MS: z.coerce.number().default(900000), // 15 minutes
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
