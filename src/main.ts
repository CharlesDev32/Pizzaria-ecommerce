import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/errors/global-exception.filter';
import { requestIdMiddleware } from './common/http/request-id.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const apiPrefix = process.env.API_PREFIX ?? 'api/v1';
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.enableCors({
    origin: (process.env.CORS_ALLOWLIST ?? '').split(',').filter(Boolean),
    credentials: true,
  });

  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(new GlobalExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Pizza in Pizza API')
    .setDescription('Production-grade e-commerce API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
