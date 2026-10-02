import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ArticleStatus, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ArticlesService } from './articles.service.js';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let transaction: {
    article: {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    category: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    tag: {
      count: ReturnType<typeof vi.fn>;
    };
  };
  let prisma: {
    article: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
  };

  const category = {
    id: '0199aaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa',
    name: 'Development',
    slug: 'development',
  };

  const tag = {
    id: '0199bbbb-bbbb-7bbb-8bbb-bbbbbbbbbbbb',
    name: 'NestJS',
    slug: 'nestjs',
  };

  const articleResult = {
    id: '0199cccc-cccc-7ccc-8ccc-cccccccccccc',
    title: 'Testing NestJS',
    slug: 'testing-nestjs',
    summary: 'A summary',
    content: { type: 'doc' },
    status: ArticleStatus.DRAFT,
    publishedAt: null,
    createdAt: new Date('2026-10-01T10:00:00Z'),
    updatedAt: new Date('2026-10-01T10:00:00Z'),
    category,
    tags: [{ tag }],
  };

  beforeEach(() => {
    transaction = {
      article: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      category: {
        findUnique: vi.fn(),
      },
      tag: {
        count: vi.fn(),
      },
    };

    prisma = {
      article: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(
        async (callback: (value: typeof transaction) => unknown) =>
          callback(transaction),
      ),
    };

    service = new ArticlesService(prisma as unknown as PrismaService);
  });

  it('creates an empty draft and flattens its tags', async () => {
    prisma.article.create.mockResolvedValue(articleResult);

    const result = await service.createDraft();

    expect(prisma.article.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: {} }),
    );
    expect(result.tags).toEqual([tag]);
  });

  it('updates category and tag relations in one transaction', async () => {
    transaction.article.findUnique.mockResolvedValue({
      id: articleResult.id,
    });
    transaction.category.findUnique.mockResolvedValue({
      id: category.id,
    });
    transaction.tag.count.mockResolvedValue(1);
    transaction.article.update.mockResolvedValue(articleResult);

    const result = await service.updateDraft(articleResult.id, {
      title: 'Testing NestJS',
      categoryId: category.id,
      tagIds: [tag.id],
    });

    expect(transaction.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: articleResult.id },
        data: expect.objectContaining({
          title: 'Testing NestJS',
          category: { connect: { id: category.id } },
          tags: {
            deleteMany: {},
            create: [
              {
                tag: { connect: { id: tag.id } },
              },
            ],
          },
        }),
      }),
    );
    expect(result.tags).toEqual([tag]);
  });

  it('rejects publishing an incomplete draft', async () => {
    transaction.article.findUnique.mockResolvedValue({
      id: articleResult.id,
      title: 'Untitled',
      slug: null,
      summary: null,
      content: null,
      categoryId: null,
      status: ArticleStatus.DRAFT,
    });

    await expect(service.publish(articleResult.id)).rejects.toThrow(
      BadRequestException,
    );
    expect(transaction.article.update).not.toHaveBeenCalled();
  });

  it('preserves an existing slug when republishing', async () => {
    transaction.article.findUnique.mockResolvedValue({
      id: articleResult.id,
      title: 'A Changed Title',
      slug: 'testing-nestjs',
      summary: 'A summary',
      content: { type: 'doc' },
      categoryId: category.id,
      status: ArticleStatus.DRAFT,
    });
    transaction.article.update.mockResolvedValue({
      ...articleResult,
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date('2026-10-02T10:00:00Z'),
    });

    await service.publish(articleResult.id);

    expect(transaction.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'testing-nestjs',
          status: ArticleStatus.PUBLISHED,
        }),
      }),
    );
  });

  it('maps a duplicate publishing slug to a conflict', async () => {
    transaction.article.findUnique.mockResolvedValue({
      id: articleResult.id,
      title: 'Testing NestJS',
      slug: null,
      summary: 'A summary',
      content: { type: 'doc' },
      categoryId: category.id,
      status: ArticleStatus.DRAFT,
    });
    transaction.article.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: '7.10.0',
      }),
    );

    await expect(service.publish(articleResult.id)).rejects.toThrow(
      ConflictException,
    );
  });

  it('returns only published articles and flattens tags', async () => {
    prisma.article.findMany.mockResolvedValue([articleResult]);

    const result = await service.findAllPublished();

    expect(prisma.article.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: ArticleStatus.PUBLISHED },
      }),
    );
    expect(result[0]?.tags).toEqual([tag]);
  });

  it('hides missing or unpublished articles from public detail', async () => {
    prisma.article.findFirst.mockResolvedValue(null);

    await expect(service.findPublishedBySlug('draft-article')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          slug: 'draft-article',
          status: ArticleStatus.PUBLISHED,
        },
      }),
    );
  });

  it('rejects unpublishing an article that is already a draft', async () => {
    prisma.article.findUnique.mockResolvedValue({
      id: articleResult.id,
      status: ArticleStatus.DRAFT,
    });

    await expect(service.unpublish(articleResult.id)).rejects.toThrow(
      ConflictException,
    );
    expect(prisma.article.update).not.toHaveBeenCalled();
  });
});
