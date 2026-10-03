import { InternalServerErrorException } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SupabaseMediaStorage } from './supabase-media.storage.js';

describe('SupabaseMediaStorage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uploads an image and returns its public bucket URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const storage = new SupabaseMediaStorage(
      'https://example.supabase.co/',
      'service-role-secret',
      'portfolio media',
    );

    const result = await storage.saveImage({
      buffer: Buffer.from('image'),
      mimetype: 'image/webp',
      size: 5,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        /^https:\/\/example\.supabase\.co\/storage\/v1\/object\/portfolio%20media\/images\/[0-9a-f-]+\.webp$/,
      ),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          apikey: 'service-role-secret',
          Authorization: 'Bearer service-role-secret',
          'Content-Type': 'image/webp',
          'x-upsert': 'false',
        }),
        body: Uint8Array.from(Buffer.from('image')),
      }),
    );
    expect(result).toMatchObject({
      filename: expect.stringMatching(/^[0-9a-f-]+\.webp$/),
      url: expect.stringMatching(
        /^https:\/\/example\.supabase\.co\/storage\/v1\/object\/public\/portfolio%20media\/images\/[0-9a-f-]+\.webp$/,
      ),
      mimeType: 'image/webp',
      size: 5,
    });
  });

  it('hides provider errors behind a generic upload error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const storage = new SupabaseMediaStorage(
      'https://example.supabase.co',
      'service-role-secret',
      'portfolio-media',
    );

    await expect(
      storage.saveImage({
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
        size: 5,
      }),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
