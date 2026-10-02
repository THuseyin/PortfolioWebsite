import { useQuery } from '@tanstack/react-query'
import { Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'

import { categoryQueries } from '../../features/categories/category-queries'
import { AdminLoginDialog } from './AdminLoginDialog'
import './site-header.css'

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const categoriesQuery = useQuery(categoryQueries.all())
  const categories = categoriesQuery.data ?? []

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link className="site-identity" to="/" aria-label="Go to home page">
          <span className="site-identity__mark" aria-hidden="true">
            HT
          </span>
        </Link>

        <nav className="desktop-navigation" aria-label="Primary navigation">
          <DesktopNavigationLink label="All articles" to="/articles" />
          {categories.map((category) => (
            <DesktopNavigationLink
              key={category.id}
              label={category.name}
              to={`/categories/${category.slug}`}
            />
          ))}
          {categoriesQuery.isError && (
            <span className="navigation-status">Categories unavailable</span>
          )}
        </nav>

        <div className="site-header__actions">
          <AdminLoginDialog />
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          >
            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-navigation"
            aria-label="Mobile navigation"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mobile-navigation__index">
              <span className="eyebrow">Index / 01</span>
              <span className="eyebrow">Navigation</span>
            </div>
            <div className="mobile-navigation__links">
              <MobileNavigationLink
                index="01"
                label="Home"
                to="/"
                onNavigate={() => setMobileMenuOpen(false)}
              />
              <MobileNavigationLink
                index="02"
                label="All articles"
                to="/articles"
                onNavigate={() => setMobileMenuOpen(false)}
              />
              {categories.map((category, index) => (
                <MobileNavigationLink
                  index={String(index + 3).padStart(2, '0')}
                  key={category.id}
                  label={category.name}
                  to={`/categories/${category.slug}`}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function DesktopNavigationLink({ label, to }: { label: string; to: string }) {
  return (
    <NavLink className="navigation-link" to={to}>
      {({ isActive }) => (
        <>
          <span>{label}</span>
          {isActive && (
            <motion.span
              className="navigation-link__indicator"
              layoutId="desktop-navigation-indicator"
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </>
      )}
    </NavLink>
  )
}

type MobileNavigationLinkProps = {
  index: string
  label: string
  onNavigate: () => void
  to: string
}

function MobileNavigationLink({
  index,
  label,
  onNavigate,
  to,
}: MobileNavigationLinkProps) {
  return (
    <NavLink className="mobile-navigation__link" to={to} onClick={onNavigate}>
      <span>{index}</span>
      <strong>{label}</strong>
    </NavLink>
  )
}
