import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateHomepageDto } from './dto/update-homepage.dto.js';

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService) {}

  async find() {
    const content = await this.prisma.homePageContent.findUnique({ where: { id: 'home' } });
    if (!content) throw new NotFoundException('Homepage content not found');
    return content;
  }

  update(input: UpdateHomepageDto) {
    return this.prisma.homePageContent.update({
      where: { id: 'home' },
      data: {
        name: input.name,
        eyebrow: input.eyebrow,
        role: input.role,
        locations: input.locations as unknown as Prisma.InputJsonArray,
        aboutHeadline: input.aboutHeadline,
        aboutNote: input.aboutNote,
        currently: input.currently,
        interests: input.interests,
        instagramLabel: input.instagramLabel,
        instagramUrl: input.instagramUrl,
        collageImages: input.collageImages,
      },
    });
  }
}
