import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  return (
    <>
      <section className="archive-list" aria-label={t('archive.label')}>
        {isPending && <ArchiveLoading />}
        {isError && <ArchiveMessage title={t('archive.offlineTitle')} message={errorMessage} onRetry={onRetry} />}
        {!isPending && !isError && articles.length === 0 && (
          <ArchiveMessage
            title={t('archive.emptyTitle')}
            message={t('archive.emptyMessage')}
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
        <nav className="archive-pagination" aria-label={t('archive.pagination')}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ArrowLeft aria-hidden="true" /> {t('archive.previous')}
          </button>
          <span>
            {String(page).padStart(2, '0')} / {String(pagination.totalPages).padStart(2, '0')}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {t('archive.next')} <ArrowRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </>
  )
}

function ArticleArchiveCard({ article, index }: { article: ArticleSummary; index: number }) {
  const { i18n, t } = useTranslation()
  const locale = dateLocale(i18n.resolvedLanguage)
  const date = new Intl.DateTimeFormat(locale, {
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
          alt={t('article.imageAlt', { title: article.title })}
        />
        <span>{String(index).padStart(2, '0')}</span>
      </div>
      <span className="archive-row__content">
        <span className="archive-row__meta">
          <span>{article.category?.name ?? t('archive.uncategorized')}</span>
          <time dateTime={article.publishedAt}>{date}</time>
        </span>
        <strong>{article.title}</strong>
        {article.summary && <small>{article.summary}</small>}
      </span>
      <ArrowUpRight className="archive-row__arrow" aria-hidden="true" />
    </Link>
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

function ArchiveLoading() {
  const { t } = useTranslation()
  return (
    <div className="archive-loading" aria-label={t('archive.loading')}>
      {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
    </div>
  )
}

function ArchiveMessage({ title, message, onRetry }: { title: string; message: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="archive-message">
      <p className="eyebrow">{t('archive.status')}</p>
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>{t('archive.retry')}</button>}
    </div>
  )
}
