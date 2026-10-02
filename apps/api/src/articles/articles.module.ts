import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminArticlesController } from './admin-articles.controller.js';
import { ArticlesService } from './articles.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
