import { NotFoundException } from '@nestjs/common';
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

import { MediaService } from './media.service.js';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MediaService();
  });

  it('stores an uploaded image under a generated filename', async () => {
    const result = await service.saveImage({
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
    await expect(service.openImage('../../private-file')).rejects.toThrow(
      NotFoundException,
    );
    expect(access).not.toHaveBeenCalled();
  });
});
