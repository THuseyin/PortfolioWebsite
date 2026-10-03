import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  const isProduction =
    configService.get('NODE_ENV') === 'production';

  const PostgreSqlSessionStore =
    connectPgSimple(session);

  if (isProduction) {
    app.getHttpAdapter()
      .getInstance()
      .set('trust proxy', 1);
  }

  app.enableCors({
    origin:
      configService.getOrThrow<string>('WEB_ORIGIN'),
    credentials: true,
  });

  app.use(
    session({
      name: 'portfolio.sid',
      secret:
        configService.getOrThrow<string>(
          'SESSION_SECRET',
        ),
      store: new PostgreSqlSessionStore({
        conString:
          configService.getOrThrow<string>(
            'DATABASE_URL',
          ),
        tableName: 'session',
        createTableIfMissing: false,
      }),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: 8 * 60 * 60 * 1000,
      },
    }),
  );

  app.setGlobalPrefix('api');

  const webDistPath = fileURLToPath(
    new URL('../../web/dist', import.meta.url),
  );

  if (existsSync(webDistPath)) {
    app.useStaticAssets(webDistPath, { index: false });
    app.use((request, response, next) => {
      if (
        request.method !== 'GET' ||
        request.path.startsWith('/api') ||
        request.path.includes('.')
      ) {
        next();
        return;
      }

      response.sendFile(`${webDistPath}/index.html`);
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
