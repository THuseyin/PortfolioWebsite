import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AdminHomepageController } from './admin-homepage.controller.js';
import { HomepageController } from './homepage.controller.js';
import { HomepageService } from './homepage.service.js';

@Module({ imports: [PrismaModule, AuthModule], controllers: [HomepageController, AdminHomepageController], providers: [HomepageService] })
export class HomepageModule {}
