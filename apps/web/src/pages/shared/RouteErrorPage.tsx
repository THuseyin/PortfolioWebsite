import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'

import { PageMeta } from '../../components/PageMeta'
import './status-page.css'

export function RouteErrorPage() {
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <main className="status-page status-page--error">
      <PageMeta title={notFound ? 'Page not found' : 'Something went wrong'} />
      <div className="status-page__index"><span>{notFound ? '404' : '500'}</span><i /></div>
      <div className="status-page__content">
        <p className="eyebrow">System / Interrupted</p>
        <h1>{notFound ? 'This page slipped away.' : 'The page lost its thread.'}</h1>
        <p>{notFound ? 'The address may have changed or the page no longer exists.' : 'An unexpected error interrupted this view. Your content has not been changed.'}</p>
        <div className="status-page__actions">
          <button type="button" onClick={() => window.location.reload()}><RefreshCw aria-hidden="true" /> Try again</button>
          <Link to="/"><ArrowLeft aria-hidden="true" /> Return home</Link>
        </div>
      </div>
    </main>
  )
}
