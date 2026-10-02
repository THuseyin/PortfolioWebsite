import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'

import { ArticleArchive } from '../../components/public/ArticleArchive'
import { articleQueries } from '../../features/articles/article-queries'
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

      <ArticleArchive
        articles={articles}
        errorMessage="The notes could not be loaded. Check that the API is running and try again."
        isError={articlesQuery.isError}
        isPending={articlesQuery.isPending}
        onPageChange={changePage}
        page={page}
        pagination={pagination}
      />
    </div>
  )
}
