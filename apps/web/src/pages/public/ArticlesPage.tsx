import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import { articleQueries } from '../../features/articles/article-queries'
import type { ArticleSummary } from '../../types/article'
import './articles-page.css'

const pageSize = 8

export function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedPage = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const articlesQuery = useQuery(articleQueries.all(page, pageSize))
  const articles = articlesQuery.data?.items ?? []
  const pagination = articlesQuery.data?.pagination

  const changePage = (nextPage: number) => {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="archive-page">
      <header className="archive-hero">
        <h1>All Articles</h1>
        <span className="archive-hero__count">
          {pagination ? String(pagination.totalItems).padStart(2, '0') : '—'} notes
        </span>
      </header>

      <section className="archive-list" aria-label="Article archive">
        {articlesQuery.isPending && <ArchiveLoading />}
        {articlesQuery.isError && (
          <ArchiveMessage
            title="The archive is offline"
            message="The notes could not be loaded. Check that the API is running and try again."
          />
        )}
        {articlesQuery.isSuccess && articles.length === 0 && (
          <ArchiveMessage
            title="No published notes yet"
            message="New writing will appear here once it is published."
          />
        )}
        {articles.map((article, index) => (
          <ArchiveRow
            article={article}
            index={(page - 1) * pageSize + index + 1}
            key={article.id}
          />
        ))}
      </section>

      {pagination && pagination.totalPages > 1 && (
        <nav className="archive-pagination" aria-label="Archive pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
          >
            <ArrowLeft aria-hidden="true" /> Previous
          </button>
          <span>
            {String(page).padStart(2, '0')} / {String(pagination.totalPages).padStart(2, '0')}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => changePage(page + 1)}
          >
            Next <ArrowRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}

function ArchiveRow({ article, index }: { article: ArticleSummary; index: number }) {
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(article.publishedAt))

  return (
    <Link className="archive-row" to={`/articles/${article.slug}`}>
      <div className="archive-row__image">
        <img
          src={`/images/home-collage/collage-${String(((index - 1) % 12) + 1).padStart(2, '0')}.jpg`}
          alt=""
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

function ArchiveMessage({ title, message }: { title: string; message: string }) {
  return (
    <div className="archive-message">
      <p className="eyebrow">Archive status</p>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  )
}
