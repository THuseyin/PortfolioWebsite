import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { PageMeta } from '../../components/PageMeta'
import './status-page.css'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <section className="status-page">
      <PageMeta title={t('status.notFoundMeta')} description={t('status.notFoundDescription')} />
      <div className="status-page__index"><span>404</span><i /></div>
      <div className="status-page__content">
        <p className="eyebrow">{t('status.wrongTurn')}</p>
        <h1>{t('status.nowhere')}</h1>
        <p>{t('status.missingMessage')}</p>
        <div className="status-page__actions">
          <Link to="/"><ArrowLeft aria-hidden="true" /> {t('status.home')}</Link>
          <Link to="/articles">{t('status.browse')} <ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
