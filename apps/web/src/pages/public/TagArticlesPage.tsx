import { useQuery } from '@tanstack/react-query'
import { Navigate, useParams, useSearchParams } from 'react-router'

import { ArticleArchive } from '../../components/public/ArticleArchive'
import { PageMeta } from '../../components/PageMeta'
import { articleQueries } from '../../features/articles/article-queries'
import { tagQueries } from '../../features/tags/tag-queries'
import './articles-page.css'

const pageSize = 8

export function TagArticlesPage() {
  const { tagSlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedPage = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const articlesQuery = useQuery({
    ...articleQueries.byTag(tagSlug ?? '', page, pageSize),
    enabled: Boolean(tagSlug),
  })
  const tagsQuery = useQuery(tagQueries.all())

  if (!tagSlug) {
    return <Navigate replace to="/articles" />
  }

  const changePage = (nextPage: number) => {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const tagName = tagsQuery.data?.find((tag) => tag.slug === tagSlug)?.name ?? formatSlug(tagSlug)
  const articles = articlesQuery.data?.items ?? []
  const pagination = articlesQuery.data?.pagination

  return (
    <div className="archive-page archive-page--tag">
      <PageMeta title={`#${tagName}`} description={`Articles tagged with ${tagName}.`} />
      <header className="archive-hero">
        <h1>#{tagName}</h1>
        <span className="archive-hero__count">
          {pagination ? String(pagination.totalItems).padStart(2, '0') : '—'} notes
        </span>
      </header>

      <ArticleArchive
        articles={articles}
        errorMessage={`The ${tagName} notes could not be loaded. Please try again.`}
        isError={articlesQuery.isError || tagsQuery.isError}
        isPending={articlesQuery.isPending || tagsQuery.isPending}
        onRetry={() => { articlesQuery.refetch(); tagsQuery.refetch() }}
        onPageChange={changePage}
        page={page}
        pagination={pagination}
      />
    </div>
  )
}

function formatSlug(slug: string) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
