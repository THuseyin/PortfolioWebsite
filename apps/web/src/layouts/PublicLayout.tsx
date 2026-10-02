import { Outlet, useLocation } from 'react-router'
import { motion } from 'motion/react'

import { SiteFooter } from '../components/public/SiteFooter'
import { SiteHeader } from '../components/public/SiteHeader'

export function PublicLayout() {
  const location = useLocation()

  return (
    <div className="site-frame">
      <SiteHeader />
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <main className="site-main">
          <Outlet />
        </main>
      </motion.div>
      <SiteFooter />
    </div>
  )
}
