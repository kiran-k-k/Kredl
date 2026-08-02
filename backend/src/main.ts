import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { SecurityLoggerInterceptor } from './common/interceptors/security-logger.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';

import mongoSanitize from 'express-mongo-sanitize';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  // Security: Helmet
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
      hsts: process.env.NODE_ENV === 'production',
      hidePoweredBy: true,
      xssFilter: true,
      noSniff: true,
      frameguard: { action: 'deny' },
    }),
  );

  // Security: Data Sanitization (NoSQL injection)
  app.use((req: any, res: any, next: any) => {
    if (req.query) {
      Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    next();
  });
  app.use(mongoSanitize());

  // Optimization: Compression
  app.use(compression());

  // Parser: CookieParser
  app.use(cookieParser());

  // Global Prefix
  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // CORS
  const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(url => url.trim());
  app.enableCors({
    origin: frontendUrls,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global Interceptor & Filter
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new SecurityLoggerInterceptor(),
  );
  app.useGlobalFilters(new MongoExceptionFilter(), new AllExceptionsFilter());

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Kredl API')
    .setDescription('The Kredl platform API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication')
    .addTag('Courses')
    .addTag('Modules')
    .addTag('Lessons')
    .addTag('Lesson Notes')
    .addTag('Projects')
    .addTag('Module Quizzes')
    .addTag('Quiz Questions')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}/api/v1`);
  logger.log(`Swagger Docs available on: ${await app.getUrl()}/api/docs`);
}
void bootstrap();
