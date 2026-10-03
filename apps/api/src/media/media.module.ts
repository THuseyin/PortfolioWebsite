import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AuthModule } from '../auth/auth.module.js';
import { AdminMediaController } from './admin-media.controller.js';
import { MediaController } from './media.controller.js';
import { LocalMediaStorage } from './local-media.storage.js';
import { MEDIA_STORAGE } from './media-storage.js';
import { MediaService } from './media.service.js';
import { SupabaseMediaStorage } from './supabase-media.storage.js';

@Module({
  imports: [AuthModule],
  controllers: [MediaController, AdminMediaController],
  providers: [
    MediaService,
    {
      provide: MEDIA_STORAGE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const driver = configService.get('MEDIA_STORAGE_DRIVER', 'local');

        if (driver === 'local') {
          return new LocalMediaStorage();
        }

        if (driver === 'supabase') {
          return new SupabaseMediaStorage(
            configService.getOrThrow<string>('SUPABASE_URL'),
            configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
            configService.getOrThrow<string>('SUPABASE_MEDIA_BUCKET'),
          );
        }

        throw new Error(`Unsupported media storage driver: ${driver}`);
      },
    },
  ],
})
export class MediaModule {}
