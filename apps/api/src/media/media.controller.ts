import { Controller, Get, Param, StreamableFile } from '@nestjs/common';

import { MediaService } from './media.service.js';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('images/:filename')
  async getImage(@Param('filename') filename: string) {
    const image = await this.mediaService.openImage(filename);

    return new StreamableFile(image.stream, {
      type: image.mimeType,
      disposition: 'inline',
    });
  }
}
