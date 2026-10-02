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
  headerImageUrl: string | null
  publishedAt: string
  category: Category | null
  tags: Tag[]
}

export type TiptapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
  text?: string
}

export type ArticleDetail = ArticleSummary & {
  content: TiptapNode | null
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
