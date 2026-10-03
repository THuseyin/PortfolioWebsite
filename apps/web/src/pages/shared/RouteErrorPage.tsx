import { ArrowLeft, RefreshCw } from 'lucide-react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import { useTranslation } from 'react-i18next'

import { PageMeta } from '../../components/PageMeta'
import './status-page.css'

export function RouteErrorPage() {
  const { t } = useTranslation()
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <main className="status-page status-page--error">
      <PageMeta title={notFound ? t('status.notFoundMeta') : t('status.errorMeta')} />
      <div className="status-page__index"><span>{notFound ? '404' : '500'}</span><i /></div>
      <div className="status-page__content">
        <p className="eyebrow">{t('status.interrupted')}</p>
        <h1>{notFound ? t('status.slipped') : t('status.lostThread')}</h1>
        <p>{notFound ? t('status.changedMessage') : t('status.errorMessage')}</p>
        <div className="status-page__actions">
          <button type="button" onClick={() => window.location.reload()}><RefreshCw aria-hidden="true" /> {t('status.retry')}</button>
          <Link to="/"><ArrowLeft aria-hidden="true" /> {t('status.home')}</Link>
        </div>
      </div>
    </main>
  )
}
