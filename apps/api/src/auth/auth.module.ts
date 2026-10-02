import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller.js';
import { AdminAuthGuard } from './guards/admin-auth.guard.js';
import { AuthService } from './auth.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AdminAuthGuard],
  exports: [AdminAuthGuard],
})
export class AuthModule {}