import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().positive().default(3000),
  API_PREFIX: z.string().min(1).default('api/v1'),
  APP_NAME: z.string().min(1).default('Pizza in Pizza API'),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/pizza_in_pizza?schema=public'),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  CORS_ALLOWLIST: z.string().min(1).default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  JWT_ACCESS_SECRET: z.string().default('change_me_access'),
  JWT_REFRESH_SECRET: z.string().default('change_me_refresh'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  AUTH_RATE_LIMIT_MAX: z.string().default('10'),
  AUTH_BRUTE_FORCE_BLOCK_MINUTES: z.string().default('15'),
  MAX_UPLOAD_SIZE_BYTES: z.string().default(String(5 * 1024 * 1024)),
  ALLOWED_UPLOAD_MIME: z.string().default('image/jpeg,image/png,image/webp'),
  WEBHOOK_FAKE_SECRET: z.string().default('fake_webhook_secret'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
