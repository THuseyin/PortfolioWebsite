import { Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AdminAuthGuard } from '../auth/guards/admin-auth.guard.js';
import { ArticlesService } from './articles.service.js';

@Controller('admin/articles')
@UseGuards(AdminAuthGuard)
export class AdminArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll() {
    return this.articlesService.findAllForAdmin();
  }

  @Post()
  createDraft() {
    return this.articlesService.createDraft();
  }
}
