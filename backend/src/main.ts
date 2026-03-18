import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import getPort from 'get-port';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = new Logger('Bootstrap');
  const preferredPort = Number(process.env.PORT ?? 8000);
  const appName = process.env.APP_NAME ?? 'personal-blog-api';
  const corsOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const portCandidates = Array.from({ length: 21 }, (_, index) => preferredPort + index);
  const port = await getPort({
    port: portCandidates,
  });

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Personal Blog API')
    .setDescription('Personal blog backend scaffold API documentation.')
    .setVersion('0.1.0')
    .addTag('health')
    .addTag('public')
    .addTag('admin')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Personal Blog API Docs',
  });

  await app.listen(port);

  if (port !== preferredPort) {
    logger.warn(
      `Preferred port ${preferredPort} was busy, switched to http://localhost:${port}`,
    );
  }

  logger.log(`${appName} is running at http://localhost:${port}/api/health`);
  logger.log(`Swagger docs available at http://localhost:${port}/docs`);
}

void bootstrap();
