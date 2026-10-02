import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api-client'

export type AdminSession = {
  authenticated: boolean
}

export type LoginCredentials = {
  username: string
  password: string
}

export const authQueries = {
  session: () =>
    queryOptions({
      queryKey: ['admin', 'session'],
      queryFn: () => apiRequest<AdminSession>('/admin/auth/session'),
      retry: false,
      staleTime: 0,
    }),
}

export function loginAdmin(credentials: LoginCredentials) {
  return apiRequest<AdminSession>('/admin/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

export function logoutAdmin() {
  return apiRequest<void>('/admin/auth/logout', { method: 'POST' })
}
