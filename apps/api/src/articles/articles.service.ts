import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '../generated/prisma/client.js';
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
}
