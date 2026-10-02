import { queryOptions } from '@tanstack/react-query'

import { apiRequest } from '../../lib/api-client'
import type { Category } from '../../types/category'
import type { Tag } from '../../types/article'
import type { TiptapNode } from '../../types/article'

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

export type AdminArticleDetail = AdminArticleSummary & {
  summary: string | null
  content: TiptapNode | null
}

export type UpdateAdminArticleInput = {
  title: string
  summary: string | null
  headerImageUrl: string | null
  content: Record<string, unknown> | null
  categoryId: string | null
  tagIds: string[]
}

export type UploadedImage = {
  filename: string
  url: string
  mimeType: string
  size: number
}

export type AdminArticleFilters = {
  page: number
  limit: number
  status?: ArticleStatus
  search?: string
}

export const adminArticleQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: ['admin', 'articles', 'detail', id],
      queryFn: () => apiRequest<AdminArticleDetail>(`/admin/articles/${id}`),
    }),
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

export function updateAdminArticle(id: string, input: UpdateAdminArticleInput) {
  return apiRequest<AdminArticleDetail>(`/admin/articles/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function uploadAdminImage(file: File) {
  const body = new FormData()
  body.append('file', file)
  return apiRequest<UploadedImage>('/admin/media/images', { method: 'POST', body })
}

export function createAdminArticle() {
  return apiRequest<AdminArticleDetail>('/admin/articles', { method: 'POST' })
}

export function publishAdminArticle(id: string) {
  return apiRequest<AdminArticleDetail>(`/admin/articles/${id}/publish`, { method: 'POST' })
}

export function unpublishAdminArticle(id: string) {
  return apiRequest<AdminArticleDetail>(`/admin/articles/${id}/unpublish`, { method: 'POST' })
}

export function deleteAdminArticle(id: string) {
  return apiRequest<void>(`/admin/articles/${id}`, { method: 'DELETE' })
}
