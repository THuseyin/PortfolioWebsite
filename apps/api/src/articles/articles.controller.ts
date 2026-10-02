import { Controller, Get, Param, Query } from '@nestjs/common';

import { ArticlesService } from './articles.service.js';
import { PublicArticlesQueryDto } from './dto/public-articles-query.dto.js';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query() query: PublicArticlesQueryDto) {
    return this.articlesService.findAllPublished(query);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findPublishedBySlug(slug);
  }
}
