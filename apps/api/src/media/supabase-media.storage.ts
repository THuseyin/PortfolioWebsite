import { randomUUID } from 'node:crypto';

import { InternalServerErrorException } from '@nestjs/common';

import {
  IMAGE_EXTENSIONS,
  type MediaStorage,
  type StoredImage,
  type UploadedImage,
} from './media-storage.js';

export class SupabaseMediaStorage implements MediaStorage {
  private readonly baseUrl: string;

  constructor(
    supabaseUrl: string,
    private readonly serviceRoleKey: string,
    private readonly bucket: string,
  ) {
    this.baseUrl = supabaseUrl.replace(/\/$/, '');
  }

  async saveImage(file: UploadedImage): Promise<StoredImage> {
    const extension = IMAGE_EXTENSIONS[file.mimetype];
    const filename = `${randomUUID()}.${extension}`;
    const objectPath = `images/${filename}`;
    const encodedBucket = encodeURIComponent(this.bucket);
    const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
    const requestBody = Uint8Array.from(file.buffer);

    let response: Response;

    try {
      response = await fetch(
        `${this.baseUrl}/storage/v1/object/${encodedBucket}/${encodedPath}`,
        {
          method: 'POST',
          headers: {
            apikey: this.serviceRoleKey,
            Authorization: `Bearer ${this.serviceRoleKey}`,
            'Cache-Control': '3600',
            'Content-Type': file.mimetype,
            'x-upsert': 'false',
          },
          body: requestBody,
        },
      );
    } catch {
      throw new InternalServerErrorException('Image upload failed');
    }

    if (!response.ok) {
      throw new InternalServerErrorException('Image upload failed');
    }

    return {
      filename,
      url: `${this.baseUrl}/storage/v1/object/public/${encodedBucket}/${encodedPath}`,
      mimeType: file.mimetype,
      size: file.size,
    };
  }
}
