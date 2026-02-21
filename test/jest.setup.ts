process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.PORT = process.env.PORT ?? '3000';
process.env.API_PREFIX = process.env.API_PREFIX ?? 'api/v1';
process.env.APP_NAME = process.env.APP_NAME ?? 'Pizza in Pizza API';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/pizza_in_pizza?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
process.env.CORS_ALLOWLIST = process.env.CORS_ALLOWLIST ?? 'http://localhost:3000';
process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';
