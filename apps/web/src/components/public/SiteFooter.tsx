import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import './site-footer.css'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__lead">
        <p className="eyebrow">End note / {currentYear}</p>
        <p className="site-footer__statement">
          Built as a living archive of work, notes, and digital experiments.
        </p>
      </div>
      <div className="site-footer__meta">
        <span>© {currentYear}</span>
        <Link to="/articles">
          Browse the archive
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
