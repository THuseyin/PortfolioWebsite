import { describe, expect, it, vi } from 'vitest';

import { CategoriesService } from '../categories/categories.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TagsService } from '../tags/tags.service.js';

describe('taxonomy slug updates', () => {
  it('passes an edited category slug to Prisma', async () => {
    const update = vi.fn().mockResolvedValue({
      id: '0199aaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa',
      name: 'Web Notes',
      slug: 'web-notes',
    });
    const service = new CategoriesService({
      category: { update },
    } as unknown as PrismaService);

    await service.update('0199aaaa-aaaa-7aaa-8aaa-aaaaaaaaaaaa', {
      name: 'Web Notes',
      slug: 'web-notes',
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'Web Notes', slug: 'web-notes' },
      }),
    );
  });

  it('passes an edited tag slug to Prisma', async () => {
    const update = vi.fn().mockResolvedValue({
      id: '0199bbbb-bbbb-7bbb-8bbb-bbbbbbbbbbbb',
      name: 'TypeScript',
      slug: 'typescript',
    });
    const service = new TagsService({
      tag: { update },
    } as unknown as PrismaService);

    await service.update('0199bbbb-bbbb-7bbb-8bbb-bbbbbbbbbbbb', {
      name: 'TypeScript',
      slug: 'typescript',
    });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { name: 'TypeScript', slug: 'typescript' },
      }),
    );
  });
});
