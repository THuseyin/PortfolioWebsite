import * as Dialog from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Plus, X } from 'lucide-react'
import { Link } from 'react-router'

import { categoryQueries } from '../../features/categories/category-queries'
import './home-navigation.css'

export function HomeNavigation() {
  const categoriesQuery = useQuery(categoryQueries.all())
  const categories = categoriesQuery.data ?? []

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="home-navigation-trigger" type="button">
          Explore <Plus aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="home-navigation-overlay" />
        <Dialog.Content className="home-navigation-dialog">
          <Dialog.Title className="sr-only">Explore the website</Dialog.Title>
          <div className="home-navigation-dialog__topline">
            <p className="eyebrow">Navigation / Explore</p>
            <Dialog.Close className="home-navigation-close" aria-label="Close navigation">
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>

          <nav className="home-navigation-list" aria-label="Explore the website">
            <Dialog.Close asChild>
              <a href="#identity"><span>01</span><strong>Home</strong><i>↑</i></a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <a href="#recent-notes"><span>02</span><strong>Recent notes</strong><i>↓</i></a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <a href="#personal-note"><span>03</span><strong>Personal note</strong><i>↓</i></a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link to="/articles"><span>04</span><strong>All articles</strong><i>↗</i></Link>
            </Dialog.Close>
          </nav>

          <div className="home-navigation-dialog__footer">
            <div>
              <p className="eyebrow">Categories</p>
              <div className="home-navigation-categories">
                {categories.map((category) => (
                  <Dialog.Close asChild key={category.id}>
                    <Link to={`/categories/${category.slug}`}>{category.name}</Link>
                  </Dialog.Close>
                ))}
                {!categories.length && <span>Categories will appear here</span>}
              </div>
            </div>
            <a href="https://www.instagram.com/tepee.huseyin/" target="_blank" rel="noreferrer">
              Instagram <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
