import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api-client'
import type { Category } from '../../types/category'

export const categoryQueries = {
  all: () =>
    queryOptions({
      queryKey: ['categories'],
      queryFn: () => apiRequest<Category[]>('/categories'),
      staleTime: 5 * 60_000,
    }),
}
