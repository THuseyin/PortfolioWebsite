import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  IMAGE_EXTENSIONS,
  MEDIA_STORAGE,
  type MediaStorage,
  type UploadedImage,
} from './media-storage.js';

@Injectable()
export class MediaService {
  constructor(
    @Inject(MEDIA_STORAGE)
    private readonly storage: MediaStorage,
  ) {}

  async saveImage(file: UploadedImage) {
    if (!IMAGE_EXTENSIONS[file.mimetype]) {
      throw new BadRequestException('Unsupported image type');
    }

    return this.storage.saveImage(file);
  }

  openImage(filename: string) {
    if (!this.storage.openImage) {
      throw new NotFoundException('Image not found');
    }

    return this.storage.openImage(filename);
  }
}
