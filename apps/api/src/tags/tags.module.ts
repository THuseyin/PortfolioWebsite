import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminTagsController } from './admin-tags.controller.js';
import { TagsController } from './tags.controller.js';
import { TagsService } from './tags.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TagsController, AdminTagsController],
  providers: [TagsService],
})
export class TagsModule {}
