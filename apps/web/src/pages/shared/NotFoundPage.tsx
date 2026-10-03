import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'

import { PageMeta } from '../../components/PageMeta'
import './status-page.css'

export function NotFoundPage() {
  return (
    <section className="status-page">
      <PageMeta title="Page not found" description="The requested page could not be found." />
      <div className="status-page__index"><span>404</span><i /></div>
      <div className="status-page__content">
        <p className="eyebrow">Wrong turn / Empty page</p>
        <h1>This path leads nowhere.</h1>
        <p>The page may have moved, returned to draft, or never existed.</p>
        <div className="status-page__actions">
          <Link to="/"><ArrowLeft aria-hidden="true" /> Return home</Link>
          <Link to="/articles">Browse articles <ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  )
}
