import { LoggerModuleAsyncParams } from 'nestjs-pino';

export const pinoConfig: LoggerModuleAsyncParams = {
  useFactory: () => ({
    pinoHttp: {
      level: process.env.LOG_LEVEL ?? 'info',
      redact: {
        paths: (process.env.LOG_REDACT_PATHS ?? '').split(',').filter(Boolean),
        censor: '[REDACTED]',
      },
      customProps: (req) => ({
        requestId: req.headers['x-request-id'],
      }),
    },
  }),
};
