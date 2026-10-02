import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api-client'
import type { ArticleDetail, PaginatedArticles } from '../../types/article'

export const articleQueries = {
  detail: (slug: string) =>
    queryOptions({
      queryKey: ['articles', 'detail', slug],
      queryFn: () => apiRequest<ArticleDetail>(`/articles/${encodeURIComponent(slug)}`),
    }),
  all: (page = 1, limit = 8) =>
    queryOptions({
      queryKey: ['articles', 'all', page, limit],
      queryFn: () => apiRequest<PaginatedArticles>(`/articles?page=${page}&limit=${limit}`),
    }),
  byCategory: (category: string, page = 1, limit = 8) =>
    queryOptions({
      queryKey: ['articles', 'category', category, page, limit],
      queryFn: () =>
        apiRequest<PaginatedArticles>(
          `/articles?category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`,
        ),
    }),
  byTag: (tag: string, page = 1, limit = 8) =>
    queryOptions({
      queryKey: ['articles', 'tag', tag, page, limit],
      queryFn: () =>
        apiRequest<PaginatedArticles>(
          `/articles?tag=${encodeURIComponent(tag)}&page=${page}&limit=${limit}`,
        ),
    }),
  latest: (limit = 3) =>
    queryOptions({
      queryKey: ['articles', 'latest', limit],
      queryFn: () => apiRequest<PaginatedArticles>(`/articles?page=1&limit=${limit}`),
    }),
}
