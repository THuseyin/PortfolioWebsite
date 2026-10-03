import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard.js';
import { UpdateHomepageDto } from './dto/update-homepage.dto.js';
import { HomepageService } from './homepage.service.js';

@Controller('admin/homepage')
@UseGuards(AdminAuthGuard)
export class AdminHomepageController {
  constructor(private readonly service: HomepageService) {}
  @Get() find() { return this.service.find(); }
  @Patch() update(@Body() input: UpdateHomepageDto) { return this.service.update(input); }
}
