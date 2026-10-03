import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import type { ArticleSummary, PaginatedArticles } from '../../types/article'

type ArticleArchiveProps = {
  articles: ArticleSummary[]
  errorMessage: string
  isError: boolean
  isPending: boolean
  onPageChange: (page: number) => void
  onRetry: () => void
  page: number
  pagination?: PaginatedArticles['pagination']
}

export function ArticleArchive({
  articles,
  errorMessage,
  isError,
  isPending,
  onPageChange,
  onRetry,
  page,
  pagination,
}: ArticleArchiveProps) {
  return (
    <>
      <section className="archive-list" aria-label="Article archive">
        {isPending && <ArchiveLoading />}
        {isError && <ArchiveMessage title="The archive is offline" message={errorMessage} onRetry={onRetry} />}
        {!isPending && !isError && articles.length === 0 && (
          <ArchiveMessage
            title="No published notes yet"
            message="New writing will appear here once it is published."
          />
        )}
        {articles.map((article, index) => (
          <ArticleArchiveCard
            article={article}
            index={(page - 1) * (pagination?.limit ?? 8) + index + 1}
            key={article.id}
          />
        ))}
      </section>

      {pagination && pagination.totalPages > 1 && (
        <nav className="archive-pagination" aria-label="Archive pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ArrowLeft aria-hidden="true" /> Previous
          </button>
          <span>
            {String(page).padStart(2, '0')} / {String(pagination.totalPages).padStart(2, '0')}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next <ArrowRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </>
  )
}

function ArticleArchiveCard({ article, index }: { article: ArticleSummary; index: number }) {
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(article.publishedAt))

  return (
    <Link className="archive-row" to={`/articles/${article.slug}`}>
      <div className="archive-row__image">
        <img
          src={
            article.headerImageUrl ??
            `/images/home-collage/collage-${String(((index - 1) % 12) + 1).padStart(2, '0')}.jpg`
          }
          alt={`Header visual for ${article.title}`}
        />
        <span>{String(index).padStart(2, '0')}</span>
      </div>
      <span className="archive-row__content">
        <span className="archive-row__meta">
          <span>{article.category?.name ?? 'Uncategorized'}</span>
          <time dateTime={article.publishedAt}>{date}</time>
        </span>
        <strong>{article.title}</strong>
        {article.summary && <small>{article.summary}</small>}
      </span>
      <ArrowUpRight className="archive-row__arrow" aria-hidden="true" />
    </Link>
  )
}

function ArchiveLoading() {
  return (
    <div className="archive-loading" aria-label="Loading articles">
      {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
    </div>
  )
}

function ArchiveMessage({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  return (
    <div className="archive-message">
      <p className="eyebrow">Archive status</p>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
    </div>
  )
}
