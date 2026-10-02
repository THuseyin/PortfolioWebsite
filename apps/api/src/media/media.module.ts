import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module.js';
import { AdminMediaController } from './admin-media.controller.js';
import { MediaController } from './media.controller.js';
import { MediaService } from './media.service.js';

@Module({
  imports: [AuthModule],
  controllers: [MediaController, AdminMediaController],
  providers: [MediaService],
})
export class MediaModule {}
