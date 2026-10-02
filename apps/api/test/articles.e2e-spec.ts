import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import request from 'supertest';
import type { App } from 'supertest/types.js';

import { AdminArticlesController } from '../src/articles/admin-articles.controller.js';
import { ArticlesController } from '../src/articles/articles.controller.js';
import { ArticlesService } from '../src/articles/articles.service.js';
import { AdminAuthGuard } from '../src/auth/guards/admin-auth.guard.js';
import { ArticleStatus } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Articles HTTP API (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: {
    article: {
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  const article = {
    id: '0199cccc-cccc-7ccc-8ccc-cccccccccccc',
    title: 'Untitled',
    slug: null,
    summary: null,
    content: null,
    status: ArticleStatus.DRAFT,
    publishedAt: null,
    createdAt: new Date('2026-10-01T10:00:00Z'),
    updatedAt: new Date('2026-10-01T10:00:00Z'),
    category: null,
    tags: [],
  };

  beforeEach(async () => {
    prisma = {
      article: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController, AdminArticlesController],
      providers: [
        ArticlesService,
        AdminAuthGuard,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(
      session({
        secret: 'article-e2e-test-secret',
        resave: false,
        saveUninitialized: false,
      }),
    );
    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.header('x-test-admin') === 'true') {
        req.session.adminAuthenticated = true;
      }

      next();
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('rejects an unauthenticated admin request', async () => {
    await request(app.getHttpServer()).get('/api/admin/articles').expect(401);
  });

  it('validates the UUID before loading an admin article', async () => {
    await request(app.getHttpServer())
      .get('/api/admin/articles/not-a-uuid')
      .set('x-test-admin', 'true')
      .expect(400);

    expect(prisma.article.findUnique).not.toHaveBeenCalled();
  });

  it('allows an authenticated admin to create a draft', async () => {
    prisma.article.create.mockResolvedValue(article);

    const response = await request(app.getHttpServer())
      .post('/api/admin/articles')
      .set('x-test-admin', 'true')
      .expect(201);

    expect(response.body).toMatchObject({
      id: article.id,
      title: 'Untitled',
      status: ArticleStatus.DRAFT,
      tags: [],
    });
  });

  it('uses the published-only query for the public list', async () => {
    prisma.article.findMany.mockResolvedValue([]);
    prisma.article.count.mockResolvedValue(0);

    const response = await request(app.getHttpServer())
      .get('/api/articles')
      .expect(200);

    expect(response.body).toEqual({
      items: [],
      pagination: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
      },
    });

    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: ArticleStatus.PUBLISHED,
        }),
      }),
    );
  });

  it('rejects invalid public pagination values', async () => {
    await request(app.getHttpServer())
      .get('/api/articles?page=0&limit=100')
      .expect(400);

    expect(prisma.article.findMany).not.toHaveBeenCalled();
  });
});
