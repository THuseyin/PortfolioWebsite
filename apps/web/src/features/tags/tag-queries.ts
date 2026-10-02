import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api-client'
import type { Tag } from '../../types/article'

export const tagQueries = {
  all: () =>
    queryOptions({
      queryKey: ['tags'],
      queryFn: () => apiRequest<Tag[]>('/tags'),
      staleTime: 5 * 60_000,
    }),
}
