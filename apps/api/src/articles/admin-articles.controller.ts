import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { AdminAuthGuard } from '../auth/guards/admin-auth.guard.js';
import { ArticlesService } from './articles.service.js';
import { AdminArticlesQueryDto } from './dto/admin-articles-query.dto.js';
import { UpdateArticleDto } from './dto/update-article.dto.js';

@Controller('admin/articles')
@UseGuards(AdminAuthGuard)
export class AdminArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query() query: AdminArticlesQueryDto) {
    return this.articlesService.findAllForAdmin(query);
  }

  @Get(':id')
  findById(
    @Param('id', new ParseUUIDPipe({ version: '7' }))
    id: string,
  ) {
    return this.articlesService.findByIdForAdmin(id);
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

  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  unpublish(
    @Param('id', new ParseUUIDPipe({ version: '7' }))
    id: string,
  ) {
    return this.articlesService.unpublish(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '7' }))
    id: string,
  ): Promise<void> {
    await this.articlesService.remove(id);
  }
}
