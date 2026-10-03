import { Controller, Get } from '@nestjs/common';
import { HomepageService } from './homepage.service.js';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly service: HomepageService) {}
  @Get() find() { return this.service.find(); }
}
