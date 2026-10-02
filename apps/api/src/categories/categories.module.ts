import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminCategoriesController } from './admin-categories.controller.js';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    CategoriesController,
    AdminCategoriesController,
  ],
  providers: [CategoriesService],
})
export class CategoriesModule {}