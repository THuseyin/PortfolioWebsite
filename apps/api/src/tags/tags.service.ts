import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createSlug } from '../common/utils/create-slug.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.tag.findMany({
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

  async create(createTagDto: CreateTagDto) {
    const name = createTagDto.name.trim();
    const slug = createSlug(name);

    if (!slug) {
      throw new BadRequestException('Tag name must contain usable characters');
    }

    try {
      return await this.prisma.tag.create({
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
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A tag with this name or slug already exists',
        );
      }

      throw error;
    }
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    try {
      return await this.prisma.tag.update({
        where: {
          id,
        },
        data: {
          name: updateTagDto.name.trim(),
          slug: updateTagDto.slug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Tag not found');
        }

        if (error.code === 'P2002') {
          throw new ConflictException(
            'A tag with this name or slug already exists',
          );
        }
      }

      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.tag.delete({
        where: {
          id,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('Tag not found');
        }

        if (error.code === 'P2003') {
          throw new ConflictException(
            'Tag cannot be deleted while it is assigned to articles',
          );
        }
      }

      throw error;
    }
  }
}
