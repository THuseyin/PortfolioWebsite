import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  IMAGE_EXTENSIONS,
  type MediaStorage,
  type UploadedImage,
} from './media-storage.js';

export class LocalMediaStorage implements MediaStorage {
  private readonly imageDirectory = resolve(
    process.cwd(),
    '../../uploads/images',
  );

  async saveImage(file: UploadedImage) {
    const extension = IMAGE_EXTENSIONS[file.mimetype];
    const filename = `${randomUUID()}.${extension}`;

    await mkdir(this.imageDirectory, { recursive: true });
    await writeFile(resolve(this.imageDirectory, filename), file.buffer);

    return {
      filename,
      url: `/api/media/images/${filename}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async openImage(filename: string) {
    if (!/^[0-9a-f-]+\.(?:jpg|png|webp|gif)$/.test(filename)) {
      throw new NotFoundException('Image not found');
    }

    const path = resolve(this.imageDirectory, filename);

    try {
      await access(path);
    } catch {
      throw new NotFoundException('Image not found');
    }

    return {
      stream: createReadStream(path),
      mimeType: this.getMimeType(filename),
    };
  }

  private getMimeType(filename: string): string {
    if (filename.endsWith('.jpg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.webp')) return 'image/webp';
    return 'image/gif';
  }
}
