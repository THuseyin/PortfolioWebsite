import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, ExternalLink, FilePlus2, Pencil, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'

import {
  adminArticleQueries,
  createAdminArticle,
  deleteAdminArticle,
  publishAdminArticle,
  unpublishAdminArticle,
  type AdminArticleSummary,
  type ArticleStatus,
} from '../../features/articles/admin-article-api'
import { ApiError } from '../../lib/api-client'
import './admin-articles-page.css'

const pageSize = 10

export function AdminArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminArticleSummary | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const requestedPage = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const statusParam = searchParams.get('status')
  const status: ArticleStatus | undefined =
    statusParam === 'DRAFT' || statusParam === 'PUBLISHED' ? statusParam : undefined
  const search = searchParams.get('search')?.trim() || undefined
  const articlesQuery = useQuery(adminArticleQueries.list({ page, limit: pageSize, status, search }))

  const refreshArticles = () => queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] })
  const createMutation = useMutation({
    mutationFn: createAdminArticle,
    onSuccess: (article) => navigate(`/admin/articles/${article.id}/edit`),
    onError: showActionError,
  })
  const publishMutation = useMutation({
    mutationFn: publishAdminArticle,
    onSuccess: () => {
      refreshArticles()
      setNotification('Article published successfully.')
    },
    onError: showActionError,
  })
  const unpublishMutation = useMutation({
    mutationFn: unpublishAdminArticle,
    onSuccess: () => {
      refreshArticles()
      setNotification('Article returned to draft.')
    },
    onError: showActionError,
  })
  const deleteMutation = useMutation({
    mutationFn: deleteAdminArticle,
    onSuccess: () => {
      refreshArticles()
      setDeleteTarget(null)
      setNotification('Article deleted.')
    },
    onError: showActionError,
  })

  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 3_500)
    return () => window.clearTimeout(timer)
  }, [notification])

  function showActionError(error: Error) {
    if (error instanceof ApiError && error.status === 401) {
      navigate('/?admin=login', { replace: true })
      return
    }
    setActionError(error instanceof ApiError ? error.message : 'The action could not be completed.')
  }

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setSearchParams(next)
  }

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    updateFilters({ search: searchInput.trim() || undefined, page: undefined })
  }

  const pendingAction = publishMutation.isPending
    ? { id: publishMutation.variables, type: 'publish' as const }
    : unpublishMutation.isPending
      ? { id: unpublishMutation.variables, type: 'unpublish' as const }
      : deleteMutation.isPending
        ? { id: deleteMutation.variables, type: 'delete' as const }
        : null
  const pagination = articlesQuery.data?.pagination

  if (articlesQuery.error instanceof ApiError && articlesQuery.error.status === 401) {
    return <Navigate replace to="/?admin=login" />
  }

  return (
    <main className="admin-articles">
      <header className="admin-page-header">
        <div>
          <p className="eyebrow">Publishing / Articles</p>
          <h1>Articles</h1>
        </div>
        <button
          className="admin-primary-action"
          type="button"
          disabled={createMutation.isPending}
          onClick={() => {
            setActionError(null)
            createMutation.mutate()
          }}
        >
          <FilePlus2 aria-hidden="true" />
          {createMutation.isPending ? 'Creating…' : 'New article'}
        </button>
      </header>

      <div className="admin-article-toolbar">
        <form onSubmit={handleSearch}>
          <Search aria-hidden="true" />
          <input
            aria-label="Search articles"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title"
          />
          <button type="submit">Search</button>
        </form>
        <label>
          <span>Status</span>
          <select
            value={status ?? ''}
            onChange={(event) => updateFilters({ status: event.target.value || undefined, page: undefined })}
          >
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </label>
      </div>

      {actionError && <p className="admin-action-error" role="alert">{actionError}</p>}

      <section className="admin-article-list" aria-label="Admin articles">
        <div className="admin-article-list__heading">
          <span>Article</span><span>Status</span><span>Updated</span><span>Actions</span>
        </div>
        {articlesQuery.isPending && <AdminArticleLoading />}
        {articlesQuery.isError && (
          <AdminArticleMessage title="Articles unavailable" message="The article list could not be loaded." />
        )}
        {articlesQuery.isSuccess && articlesQuery.data.items.length === 0 && (
          <AdminArticleMessage title="No articles found" message="Create a draft or adjust the current filters." />
        )}
        {articlesQuery.data?.items.map((article) => (
          <AdminArticleRow
            article={article}
            busyAction={pendingAction?.id === article.id ? pendingAction.type : null}
            key={article.id}
            onDelete={() => setDeleteTarget(article)}
            onPublish={() => {
              setActionError(null)
              publishMutation.mutate(article.id)
            }}
            onUnpublish={() => {
              setActionError(null)
              unpublishMutation.mutate(article.id)
            }}
          />
        ))}
      </section>

      {pagination && pagination.totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Admin article pagination">
          <button disabled={page <= 1} onClick={() => updateFilters({ page: String(page - 1) })}>
            <ArrowLeft aria-hidden="true" /> Previous
          </button>
          <span>{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => updateFilters({ page: String(page + 1) })}>
            Next <ArrowRight aria-hidden="true" />
          </button>
        </nav>
      )}

      <DeleteArticleDialog
        article={deleteTarget}
        deleting={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          setActionError(null)
          deleteMutation.mutate(deleteTarget.id)
        }}
      />

      {notification && (
        <div className="admin-toast" role="status">
          <Check aria-hidden="true" />
          <span>{notification}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setNotification(null)}>
            <X aria-hidden="true" />
          </button>
        </div>
      )}
    </main>
  )
}

type AdminArticleRowProps = {
  article: AdminArticleSummary
  busyAction: 'delete' | 'publish' | 'unpublish' | null
  onDelete: () => void
  onPublish: () => void
  onUnpublish: () => void
}

function AdminArticleRow({ article, busyAction, onDelete, onPublish, onUnpublish }: AdminArticleRowProps) {
  const updatedAt = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(article.updatedAt))

  return (
    <article className="admin-article-row">
      <div className="admin-article-row__title">
        {article.headerImageUrl ? <img src={article.headerImageUrl} alt="" /> : <span className="admin-article-row__placeholder" />}
        <div>
          <strong>{article.title}</strong>
          <small>{article.category?.name ?? 'No category'}</small>
        </div>
      </div>
      <span className={`admin-status admin-status--${article.status.toLowerCase()}`}>{article.status}</span>
      <time dateTime={article.updatedAt}>{updatedAt}</time>
      <div className="admin-article-row__actions">
        {article.status === 'DRAFT' ? (
          <button disabled={Boolean(busyAction)} type="button" onClick={onPublish}>
            {busyAction === 'publish' ? 'Publishing…' : 'Publish'}
          </button>
        ) : (
          <button disabled={Boolean(busyAction)} type="button" onClick={onUnpublish}>
            {busyAction === 'unpublish' ? 'Updating…' : 'Unpublish'}
          </button>
        )}
        {article.slug && article.status === 'PUBLISHED' && (
          <Link title="Open public article" target="_blank" rel="noreferrer" to={`/articles/${article.slug}`}>
            <ExternalLink aria-hidden="true" /><span className="sr-only">Open public article</span>
          </Link>
        )}
        <Link title="Edit article" to={`/admin/articles/${article.id}/edit`}>
          <Pencil aria-hidden="true" /><span className="sr-only">Edit article</span>
        </Link>
        <button className="admin-icon-button" title="Delete article" disabled={Boolean(busyAction)} type="button" onClick={onDelete}>
          <Trash2 aria-hidden="true" /><span className="sr-only">Delete article</span>
        </button>
      </div>
    </article>
  )
}

function DeleteArticleDialog({ article, deleting, onCancel, onConfirm }: {
  article: AdminArticleSummary | null
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog.Root open={Boolean(article)} onOpenChange={(open) => { if (!open && !deleting) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-confirm-overlay" />
        <Dialog.Content className="admin-confirm-dialog">
          <div className="admin-confirm-dialog__index">
            <span className="eyebrow">Destructive action</span>
            <Dialog.Close disabled={deleting} aria-label="Close delete confirmation"><X aria-hidden="true" /></Dialog.Close>
          </div>
          <Dialog.Title>Delete this article?</Dialog.Title>
          <Dialog.Description>
            “{article?.title}” will be permanently removed. This action cannot be undone.
          </Dialog.Description>
          <div className="admin-confirm-dialog__actions">
            <Dialog.Close disabled={deleting}>Keep article</Dialog.Close>
            <button type="button" disabled={deleting} onClick={onConfirm}>
              {deleting ? 'Deleting…' : 'Delete permanently'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function AdminArticleLoading() {
  return <div className="admin-article-loading" aria-label="Loading articles">{Array.from({ length: 4 }, (_, index) => <span key={index} />)}</div>
}

function AdminArticleMessage({ title, message }: { title: string; message: string }) {
  return <div className="admin-article-message"><h2>{title}</h2><p>{message}</p></div>
}
