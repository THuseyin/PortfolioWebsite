import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createSlug } from '../common/utils/create-slug.js';
import { ArticleStatus, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForAdmin() {
    const articles = await this.prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            tag: {
              name: 'asc',
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return articles.map((article) => ({
      ...article,
      tags: article.tags.map(({ tag }) => tag),
    }));
  }

  async createDraft() {
    const article = await this.prisma.article.create({
      data: {},
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return {
      ...article,
      tags: article.tags.map(({ tag }) => tag),
    };
  }

  async updateDraft(id: string, updateArticleDto: UpdateArticleDto) {
    return this.prisma.$transaction(async (transaction) => {
      const existingArticle = await transaction.article.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existingArticle) {
        throw new NotFoundException('Article not found');
      }

      if (updateArticleDto.categoryId) {
        const categoryExists = await transaction.category.findUnique({
          where: { id: updateArticleDto.categoryId },
          select: { id: true },
        });

        if (!categoryExists) {
          throw new BadRequestException('Category not found');
        }
      }

      if (updateArticleDto.tagIds) {
        const tagCount = await transaction.tag.count({
          where: {
            id: {
              in: updateArticleDto.tagIds,
            },
          },
        });

        if (tagCount !== updateArticleDto.tagIds.length) {
          throw new BadRequestException('One or more tags were not found');
        }
      }

      const data: Prisma.ArticleUpdateInput = {};

      if (updateArticleDto.title !== undefined) {
        data.title = updateArticleDto.title;
      }

      if (updateArticleDto.summary !== undefined) {
        data.summary = updateArticleDto.summary;
      }

      if (updateArticleDto.content !== undefined) {
        data.content =
          updateArticleDto.content === null
            ? Prisma.DbNull
            : (updateArticleDto.content as Prisma.InputJsonObject);
      }

      if (updateArticleDto.categoryId !== undefined) {
        data.category =
          updateArticleDto.categoryId === null
            ? { disconnect: true }
            : {
                connect: {
                  id: updateArticleDto.categoryId,
                },
              };
      }

      if (updateArticleDto.tagIds !== undefined) {
        data.tags = {
          deleteMany: {},
          create: updateArticleDto.tagIds.map((tagId) => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        };
      }

      const article = await transaction.article.update({
        where: { id },
        data,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          content: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            orderBy: {
              tag: {
                name: 'asc',
              },
            },
          },
        },
      });

      return {
        ...article,
        tags: article.tags.map(({ tag }) => tag),
      };
    });
  }

  async publish(id: string) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const existingArticle = await transaction.article.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            summary: true,
            content: true,
            categoryId: true,
            status: true,
          },
        });

        if (!existingArticle) {
          throw new NotFoundException('Article not found');
        }

        if (existingArticle.status === ArticleStatus.PUBLISHED) {
          throw new ConflictException('Article is already published');
        }

        const missingFields: string[] = [];

        if (existingArticle.title === 'Untitled') {
          missingFields.push('title');
        }

        if (!existingArticle.summary?.trim()) {
          missingFields.push('summary');
        }

        if (existingArticle.content === null) {
          missingFields.push('content');
        }

        if (!existingArticle.categoryId) {
          missingFields.push('category');
        }

        if (missingFields.length > 0) {
          throw new BadRequestException(
            `Article cannot be published; missing: ${missingFields.join(', ')}`,
          );
        }

        const slug = createSlug(existingArticle.title);

        if (!slug) {
          throw new BadRequestException(
            'Article title must contain usable characters',
          );
        }

        const article = await transaction.article.update({
          where: { id },
          data: {
            slug,
            status: ArticleStatus.PUBLISHED,
            publishedAt: new Date(),
          },
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            content: true,
            status: true,
            publishedAt: true,
            createdAt: true,
            updatedAt: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
              orderBy: {
                tag: {
                  name: 'asc',
                },
              },
            },
          },
        });

        return {
          ...article,
          tags: article.tags.map(({ tag }) => tag),
        };
      });
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Another article already uses this slug');
      }

      throw error;
    }
  }

  async findAllPublished() {
    const articles = await this.prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        publishedAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
          orderBy: { tag: { name: 'asc' } },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return articles.map((article) => ({
      ...article,
      tags: article.tags.map(({ tag }) => tag),
    }));
  }

  async findPublishedBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        status: ArticleStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        publishedAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        tags: {
          select: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
          orderBy: { tag: { name: 'asc' } },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return {
      ...article,
      tags: article.tags.map(({ tag }) => tag),
    };
  }
}
