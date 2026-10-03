import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import './site-footer.css'

export function SiteFooter() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__meta">
        <span>© {currentYear}</span>
        <Link to="/articles">
          {t('footer.browse')}
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {t('footer.top')} ↑
        </button>
      </div>
    </footer>
  )
}
