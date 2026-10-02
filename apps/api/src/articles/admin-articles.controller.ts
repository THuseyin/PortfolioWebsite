import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../auth/guards/admin-auth.guard.js';
import { ArticlesService } from './articles.service.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';

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

  @Patch(':id')
  updateDraft(
    @Param('id', new ParseUUIDPipe({ version: '7' }))
    id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.updateDraft(id, updateArticleDto);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  publish(
    @Param('id', new ParseUUIDPipe({ version: '7' }))
    id: string,
  ) {
    return this.articlesService.publish(id);
  }
}
