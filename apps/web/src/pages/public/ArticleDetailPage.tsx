import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'

import { TiptapContent } from '../../components/public/TiptapContent'
import { articleQueries } from '../../features/articles/article-queries'
import { ApiError } from '../../lib/api-client'
import './article-detail-page.css'

export function ArticleDetailPage() {
  const { slug } = useParams()
  const articleQuery = useQuery({
    ...articleQueries.detail(slug ?? ''),
    enabled: Boolean(slug),
  })

  if (!slug) {
    return <Navigate replace to="/articles" />
  }

  if (articleQuery.isPending) {
    return <ArticleDetailLoading />
  }

  if (articleQuery.isError) {
    const notFound = articleQuery.error instanceof ApiError && articleQuery.error.status === 404

    return (
      <ArticleDetailMessage
        title={notFound ? 'Note not found' : 'This note is unavailable'}
        message={
          notFound
            ? 'It may have moved, returned to draft, or never existed.'
            : 'The article could not be loaded. Check that the API is running and try again.'
        }
      />
    )
  }

  const article = articleQuery.data
  const publishedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(article.publishedAt))

  return (
    <article className="article-detail">
      <header className="article-detail__header">
        <div className="article-detail__meta">
          {article.category ? (
            <Link to={`/categories/${article.category.slug}`}>{article.category.name}</Link>
          ) : (
            <span>Uncategorized</span>
          )}
          <time dateTime={article.publishedAt}>{publishedDate}</time>
        </div>
        <h1>{article.title}</h1>
        {article.summary && <p className="article-detail__summary">{article.summary}</p>}
      </header>

      {article.headerImageUrl && (
        <figure className="article-detail__hero">
          <img src={article.headerImageUrl} alt={`Header visual for ${article.title}`} />
        </figure>
      )}

      <div className="article-detail__layout">
        <aside className="article-detail__aside">
          <p className="eyebrow">Tags</p>
          <div className="article-detail__tags">
            {article.tags.length > 0
              ? article.tags.map((tag) => (
                  <Link key={tag.id} to={`/tags/${tag.slug}`}>#{tag.name}</Link>
                ))
              : <span>No tags</span>}
          </div>
        </aside>
        <div className="article-prose">
          {article.content ? <TiptapContent document={article.content} /> : <p>No content yet.</p>}
        </div>
      </div>

      <footer className="article-detail__footer">
        <Link to="/articles"><ArrowLeft aria-hidden="true" /> All articles</Link>
        {article.category && (
          <Link to={`/categories/${article.category.slug}`}>
            More in {article.category.name} <ArrowUpRight aria-hidden="true" />
          </Link>
        )}
      </footer>
    </article>
  )
}

function ArticleDetailLoading() {
  return (
    <div className="article-detail-loading" aria-label="Loading article">
      <span />
      <span />
      <span />
    </div>
  )
}

function ArticleDetailMessage({ title, message }: { title: string; message: string }) {
  return (
    <section className="article-detail-message">
      <p className="eyebrow">Archive status</p>
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/articles"><ArrowLeft aria-hidden="true" /> Return to all articles</Link>
    </section>
  )
}
