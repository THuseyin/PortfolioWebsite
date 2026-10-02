import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { ArrowUpRight, FilePlus2, FolderTree, Hash, Newspaper, PenLine } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'

import {
  adminArticleQueries,
  createAdminArticle,
  type AdminArticleSummary,
} from '../../features/articles/admin-article-api'
import { categoryQueries } from '../../features/categories/category-queries'
import { tagQueries } from '../../features/tags/tag-queries'
import { ApiError } from '../../lib/api-client'
import './admin-dashboard-page.css'

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [allArticlesQuery, draftsQuery, publishedQuery] = useQueries({
    queries: [
      adminArticleQueries.list({ page: 1, limit: 5 }),
      adminArticleQueries.list({ page: 1, limit: 1, status: 'DRAFT' }),
      adminArticleQueries.list({ page: 1, limit: 1, status: 'PUBLISHED' }),
    ],
  })
  const categoriesQuery = useQuery(categoryQueries.all())
  const tagsQuery = useQuery(tagQueries.all())
  const createMutation = useMutation({
    mutationFn: createAdminArticle,
    onSuccess: (article) => navigate(`/admin/articles/${article.id}/edit`),
  })

  const queries = [allArticlesQuery, draftsQuery, publishedQuery, categoriesQuery, tagsQuery]
  const unauthorized = queries.some(
    (query) => query.error instanceof ApiError && query.error.status === 401,
  )

  if (unauthorized) {
    return <Navigate replace to="/?admin=login" />
  }

  const loading = queries.some((query) => query.isPending)
  const hasError = queries.some((query) => query.isError)
  const recentArticles = allArticlesQuery.data?.items ?? []

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard__hero">
        <div>
          <p className="eyebrow">Overview / Publishing workspace</p>
          <h1>Dashboard</h1>
        </div>
        <button
          className="admin-primary-action"
          type="button"
          disabled={createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          <FilePlus2 aria-hidden="true" />
          {createMutation.isPending ? 'Creating…' : 'New article'}
        </button>
      </header>

      {createMutation.isError && (
        <p className="admin-action-error" role="alert">
          {createMutation.error instanceof ApiError
            ? createMutation.error.message
            : 'A new draft could not be created.'}
        </p>
      )}

      <section className="admin-dashboard__stats" aria-label="Content totals">
        <DashboardStat label="All articles" value={allArticlesQuery.data?.pagination.totalItems} loading={loading} to="/admin/articles" />
        <DashboardStat label="Published" value={publishedQuery.data?.pagination.totalItems} loading={loading} to="/admin/articles?status=PUBLISHED" />
        <DashboardStat label="Drafts" value={draftsQuery.data?.pagination.totalItems} loading={loading} to="/admin/articles?status=DRAFT" />
        <DashboardStat label="Categories" value={categoriesQuery.data?.length} loading={loading} to="/admin/categories" />
        <DashboardStat label="Tags" value={tagsQuery.data?.length} loading={loading} to="/admin/tags" />
      </section>

      {hasError && !unauthorized && (
        <p className="admin-dashboard__warning">Some dashboard information could not be loaded.</p>
      )}

      <div className="admin-dashboard__columns">
        <section className="admin-dashboard__recent">
          <div className="admin-dashboard__section-heading">
            <div><p className="eyebrow">Recently updated</p><h2>Latest activity</h2></div>
            <Link to="/admin/articles">View all <ArrowUpRight aria-hidden="true" /></Link>
          </div>

          <div className="admin-dashboard__article-list">
            {allArticlesQuery.isPending && <div className="admin-dashboard__empty">Loading recent articles…</div>}
            {allArticlesQuery.isSuccess && recentArticles.length === 0 && <div className="admin-dashboard__empty">No articles yet.</div>}
            {recentArticles.map((article, index) => (
              <RecentArticle article={article} index={index + 1} key={article.id} />
            ))}
          </div>
        </section>

        <aside className="admin-dashboard__shortcuts">
          <div className="admin-dashboard__section-heading"><div><p className="eyebrow">Shortcuts</p><h2>Manage</h2></div></div>
          <DashboardShortcut icon={<Newspaper />} label="All articles" description="Search, publish, or edit writing." to="/admin/articles" />
          <DashboardShortcut icon={<FolderTree />} label="Categories" description="Organize the primary sections." to="/admin/categories" />
          <DashboardShortcut icon={<Hash />} label="Tags" description="Maintain the article taxonomy." to="/admin/tags" />
          <DashboardShortcut icon={<ArrowUpRight />} label="Public site" description="Open the portfolio in a new tab." to="/" external />
        </aside>
      </div>
    </main>
  )
}

function DashboardStat({ label, loading, to, value }: { label: string; loading: boolean; to: string; value?: number }) {
  return (
    <Link className="admin-dashboard__stat" to={to}>
      <span>{label}</span>
      <strong>{loading ? '—' : String(value ?? 0).padStart(2, '0')}</strong>
      <ArrowUpRight aria-hidden="true" />
    </Link>
  )
}

function RecentArticle({ article, index }: { article: AdminArticleSummary; index: number }) {
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(article.updatedAt))

  return (
    <Link className="admin-dashboard__article" to={`/admin/articles/${article.id}/edit`}>
      <span>{String(index).padStart(2, '0')}</span>
      <div>
        <strong>{article.title}</strong>
        <small>{article.category?.name ?? 'No category'}</small>
      </div>
      <span className={`admin-status admin-status--${article.status.toLowerCase()}`}>{article.status}</span>
      <time dateTime={article.updatedAt}>{date}</time>
      <PenLine aria-hidden="true" />
    </Link>
  )
}

function DashboardShortcut({ description, external = false, icon, label, to }: { description: string; external?: boolean; icon: ReactNode; label: string; to: string }) {
  return (
    <Link className="admin-dashboard__shortcut" to={to} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      <span>{icon}</span>
      <div><strong>{label}</strong><small>{description}</small></div>
      <ArrowUpRight aria-hidden="true" />
    </Link>
  )
}
