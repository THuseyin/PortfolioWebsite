import { BadRequestException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { access, mkdir, writeFile } = vi.hoisted(() => ({
  access: vi.fn(),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  access,
  mkdir,
  writeFile,
}));

import { LocalMediaStorage } from './local-media.storage.js';
import type { MediaStorage } from './media-storage.js';
import { MediaService } from './media.service.js';

describe('LocalMediaStorage', () => {
  let storage: LocalMediaStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new LocalMediaStorage();
  });

  it('stores an uploaded image under a generated filename', async () => {
    const result = await storage.saveImage({
      buffer: Buffer.from('image'),
      mimetype: 'image/webp',
      size: 5,
    });

    expect(mkdir).toHaveBeenCalledWith(
      expect.stringMatching(/[\\/]uploads[\\/]images$/),
      { recursive: true },
    );
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/[\\/][0-9a-f-]+\.webp$/),
      Buffer.from('image'),
    );
    expect(result).toMatchObject({
      url: expect.stringMatching(/^\/api\/media\/images\/[0-9a-f-]+\.webp$/),
      mimeType: 'image/webp',
      size: 5,
    });
  });

  it('does not allow arbitrary paths when reading images', async () => {
    await expect(storage.openImage('../../private-file')).rejects.toThrow(
      NotFoundException,
    );
    expect(access).not.toHaveBeenCalled();
  });
});

describe('MediaService', () => {
  const uploadedImage = {
    buffer: Buffer.from('image'),
    mimetype: 'image/webp',
    size: 5,
  };
  const storage = {
    saveImage: vi.fn(),
    openImage: vi.fn(),
  } satisfies MediaStorage;
  const service = new MediaService(storage);

  beforeEach(() => vi.clearAllMocks());

  it('delegates supported images to the selected storage provider', async () => {
    storage.saveImage.mockResolvedValue({
      filename: 'image.webp',
      url: '/api/media/images/image.webp',
      mimeType: 'image/webp',
      size: 5,
    });

    await service.saveImage(uploadedImage);

    expect(storage.saveImage).toHaveBeenCalledWith(uploadedImage);
  });

  it('rejects unsupported image types before calling storage', async () => {
    await expect(
      service.saveImage({ ...uploadedImage, mimetype: 'image/svg+xml' }),
    ).rejects.toThrow(BadRequestException);
    expect(storage.saveImage).not.toHaveBeenCalled();
  });
});
