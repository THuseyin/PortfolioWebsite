import * as Dialog from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Plus, X } from 'lucide-react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { categoryQueries } from '../../features/categories/category-queries'
import './home-navigation.css'

export function HomeNavigation() {
  const { t } = useTranslation()
  const categoriesQuery = useQuery(categoryQueries.all())
  const categories = categoriesQuery.data ?? []

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="home-navigation-trigger" type="button">
          {t('navigation.explore')} <Plus aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="home-navigation-overlay" />
        <Dialog.Content className="home-navigation-dialog">
          <Dialog.Title className="sr-only">{t('navigation.title')}</Dialog.Title>
          <div className="home-navigation-dialog__topline">
            <p className="eyebrow">{t('navigation.index')} / {t('navigation.explore')}</p>
            <Dialog.Close className="home-navigation-close" aria-label={t('navigation.close')}>
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>

          <nav className="home-navigation-list" aria-label={t('navigation.title')}>
            <Dialog.Close asChild>
              <a href="#identity"><span>01</span><strong>{t('navigation.home')}</strong><i>↑</i></a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <a href="#recent-notes"><span>02</span><strong>{t('navigation.recent')}</strong><i>↓</i></a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <a href="#personal-note"><span>03</span><strong>{t('navigation.personal')}</strong><i>↓</i></a>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Link to="/articles"><span>04</span><strong>{t('navigation.allArticles')}</strong><i>↗</i></Link>
            </Dialog.Close>
          </nav>

          <div className="home-navigation-dialog__footer">
            <div>
              <p className="eyebrow">{t('navigation.categories')}</p>
              <div className="home-navigation-categories">
                {categories.map((category) => (
                  <Dialog.Close asChild key={category.id}>
                    <Link to={`/categories/${category.slug}`}>{category.name}</Link>
                  </Dialog.Close>
                ))}
                {!categories.length && <span>{t('navigation.categoriesEmpty')}</span>}
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
