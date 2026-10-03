import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api-client'
import type { HomepageContent, UpdateHomepageInput } from '../../types/homepage'

export const homepageQueries = {
  public: () =>
    queryOptions({
      queryKey: ['homepage'],
      queryFn: () => apiRequest<HomepageContent>('/homepage'),
    }),
  admin: () =>
    queryOptions({
      queryKey: ['admin', 'homepage'],
      queryFn: () => apiRequest<HomepageContent>('/admin/homepage'),
    }),
}

export function updateHomepage(input: UpdateHomepageInput) {
  return apiRequest<HomepageContent>('/admin/homepage', { method: 'PATCH', body: input })
}
