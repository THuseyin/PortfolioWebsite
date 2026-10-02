import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createSlug } from '../common/utils/create-slug.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name.trim();
    const slug = createSlug(name);

    if (!slug) {
      throw new BadRequestException(
        'Category name must contain usable characters',
      );
    }

    try {
      return await this.prisma.category.create({
        data: {
          name,
          slug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A category with this name or slug already exists',
        );
      }

      throw error;
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    try {
      return await this.prisma.category.update({
        where: {
          id,
        },
        data: {
          name: updateCategoryDto.name.trim(),
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Category not found',
          );
        }

        if (error.code === 'P2002') {
          throw new ConflictException(
            'A category with this name already exists',
          );
        }
      }

      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.category.delete({
        where: {
          id,
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof
        Prisma.PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Category not found',
          );
        }

        if (error.code === 'P2003') {
          throw new ConflictException(
            'Category cannot be deleted while it is assigned to articles',
          );
        }
      }

      throw error;
    }
  }
}