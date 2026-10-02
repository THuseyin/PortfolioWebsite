import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api-client'
import type { PaginatedArticles } from '../../types/article'

export const articleQueries = {
  latest: (limit = 3) =>
    queryOptions({
      queryKey: ['articles', 'latest', limit],
      queryFn: () => apiRequest<PaginatedArticles>(`/articles?page=1&limit=${limit}`),
    }),
}
