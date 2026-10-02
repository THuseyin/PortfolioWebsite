import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api-client'
import type { Category } from '../../types/category'
import type { Tag } from '../../types/article'

export type ArticleStatus = 'DRAFT' | 'PUBLISHED'

export type AdminArticleSummary = {
  id: string
  title: string
  slug: string | null
  headerImageUrl: string | null
  status: ArticleStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  category: Category | null
  tags: Tag[]
}

export type PaginatedAdminArticles = {
  items: AdminArticleSummary[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export type AdminArticleFilters = {
  page: number
  limit: number
  status?: ArticleStatus
  search?: string
}

export const adminArticleQueries = {
  list: (filters: AdminArticleFilters) =>
    queryOptions({
      queryKey: ['admin', 'articles', filters],
      queryFn: () => {
        const params = new URLSearchParams({
          page: String(filters.page),
          limit: String(filters.limit),
        })
        if (filters.status) params.set('status', filters.status)
        if (filters.search) params.set('search', filters.search)
        return apiRequest<PaginatedAdminArticles>(`/admin/articles?${params}`)
      },
    }),
}

export function createAdminArticle() {
  return apiRequest<AdminArticleSummary>('/admin/articles', { method: 'POST' })
}

export function publishAdminArticle(id: string) {
  return apiRequest<AdminArticleSummary>(`/admin/articles/${id}/publish`, { method: 'POST' })
}

export function unpublishAdminArticle(id: string) {
  return apiRequest<AdminArticleSummary>(`/admin/articles/${id}/unpublish`, { method: 'POST' })
}

export function deleteAdminArticle(id: string) {
  return apiRequest<void>(`/admin/articles/${id}`, { method: 'DELETE' })
}
