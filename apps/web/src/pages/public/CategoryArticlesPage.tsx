import { useQuery } from '@tanstack/react-query'
import { Navigate, useParams, useSearchParams } from 'react-router'

import { ArticleArchive } from '../../components/public/ArticleArchive'
import { PageMeta } from '../../components/PageMeta'
import { articleQueries } from '../../features/articles/article-queries'
import { categoryQueries } from '../../features/categories/category-queries'
import './articles-page.css'

const pageSize = 8

export function CategoryArticlesPage() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedPage = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const categoriesQuery = useQuery(categoryQueries.all())
  const articlesQuery = useQuery({
    ...articleQueries.byCategory(categorySlug ?? '', page, pageSize),
    enabled: Boolean(categorySlug),
  })
  const category = categoriesQuery.data?.find((item) => item.slug === categorySlug)
  const articles = articlesQuery.data?.items ?? []
  const pagination = articlesQuery.data?.pagination

  if (!categorySlug) {
    return <Navigate replace to="/articles" />
  }

  const changePage = (nextPage: number) => {
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const categoryName = category?.name ?? formatSlug(categorySlug)

  return (
    <div className="archive-page archive-page--category">
      <PageMeta title={categoryName} description={`Articles filed under ${categoryName}.`} />
      <header className="archive-hero">
        <h1>{categoryName}</h1>
        <span className="archive-hero__count">
          {pagination ? String(pagination.totalItems).padStart(2, '0') : '—'} notes
        </span>
      </header>

      <ArticleArchive
        articles={articles}
        errorMessage={`The ${categoryName} notes could not be loaded. Please try again.`}
        isError={articlesQuery.isError || categoriesQuery.isError}
        isPending={articlesQuery.isPending || categoriesQuery.isPending}
        onRetry={() => { articlesQuery.refetch(); categoriesQuery.refetch() }}
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
