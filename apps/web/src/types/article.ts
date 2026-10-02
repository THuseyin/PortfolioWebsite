import type { Category } from './category'

export type Tag = {
  id: string
  name: string
  slug: string
}

export type ArticleSummary = {
  id: string
  title: string
  slug: string
  summary: string | null
  publishedAt: string
  category: Category | null
  tags: Tag[]
}

export type PaginatedArticles = {
  items: ArticleSummary[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}
