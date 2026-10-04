import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { TiptapContent } from '../../components/public/TiptapContent'
import { PageMeta } from '../../components/PageMeta'
import { articleQueries } from '../../features/articles/article-queries'
import { ApiError } from '../../lib/api-client'
import './article-detail-page.css'

export function ArticleDetailPage() {
  const { i18n, t } = useTranslation()
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
        title={notFound ? t('article.notFound') : t('article.unavailable')}
        message={
          notFound
            ? t('article.notFoundMessage')
            : t('article.unavailableMessage')
        }
        onRetry={notFound ? undefined : () => articleQuery.refetch()}
      />
    )
  }

  const article = articleQuery.data
  const locale = dateLocale(i18n.resolvedLanguage)
  const publishedDate = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(article.publishedAt))

  return (
    <article className="article-detail">
      <PageMeta title={article.title} description={article.summary} image={article.headerImageUrl} type="article" />
      <header className="article-detail__header">
        <div className="article-detail__meta">
          {article.category ? (
            <Link to={`/categories/${article.category.slug}`}>{article.category.name}</Link>
          ) : (
            <span>{t('archive.uncategorized')}</span>
          )}
          <time dateTime={article.publishedAt}>{publishedDate}</time>
        </div>
        <h1>{article.title}</h1>
        {article.summary && <p className="article-detail__summary">{article.summary}</p>}
      </header>

      {article.headerImageUrl && (
        <figure className="article-detail__hero">
          <img src={article.headerImageUrl} alt={t('article.imageAlt', { title: article.title })} />
        </figure>
      )}

      <div className="article-detail__layout">
        <aside className="article-detail__aside">
          <p className="eyebrow">{t('article.tags')}</p>
          <div className="article-detail__tags">
            {article.tags.length > 0
              ? article.tags.map((tag) => (
                  <Link key={tag.id} to={`/tags/${tag.slug}`}>#{tag.name}</Link>
                ))
              : <span>{t('article.noTags')}</span>}
          </div>
        </aside>
        <div className="article-prose">
          {article.content ? <TiptapContent document={article.content} /> : <p>{t('article.noContent')}</p>}
        </div>
      </div>

      <footer className="article-detail__footer">
        <Link to="/articles"><ArrowLeft aria-hidden="true" /> {t('article.allArticles')}</Link>
        {article.category && (
          <Link to={`/categories/${article.category.slug}`}>
            {t('article.moreIn', { name: article.category.name })} <ArrowUpRight aria-hidden="true" />
          </Link>
        )}
      </footer>
    </article>
  )
}

function dateLocale(language?: string) {
  if (language?.startsWith('tr')) return 'tr-TR'
  if (language?.startsWith('de')) return 'de-DE'
  if (language?.startsWith('zh')) return 'zh-CN'
  if (language?.startsWith('es')) return 'es-ES'
  if (language?.startsWith('hi')) return 'hi-IN'
  return 'en-GB'
}

function ArticleDetailLoading() {
  const { t } = useTranslation()
  return (
    <div className="article-detail-loading" aria-label={t('article.loading')}>
      <span />
      <span />
      <span />
    </div>
  )
}

function ArticleDetailMessage({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <section className="article-detail-message">
      <p className="eyebrow">{t('archive.status')}</p>
      <h1>{title}</h1>
      <p>{message}</p>
      <div className="article-detail-message__actions">
        {onRetry && <button type="button" onClick={onRetry}>{t('archive.retry')}</button>}
        <Link to="/articles"><ArrowLeft aria-hidden="true" /> {t('article.return')}</Link>
      </div>
    </section>
  )
}
