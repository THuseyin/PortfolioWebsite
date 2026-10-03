import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const siteName = 'Hüseyin Tepe'

type PageMetaProps = {
  title?: string
  description?: string | null
  image?: string | null
  type?: 'website' | 'article'
}

export function PageMeta({ title, description, image, type = 'website' }: PageMetaProps) {
  const { t, i18n } = useTranslation()
  useEffect(() => {
    const pageTitle = title ? `${title} — ${siteName}` : `${siteName} — ${t('meta.defaultTitle')}`
    const pageDescription = description?.trim() || t('meta.defaultDescription')
    const imageUrl = new URL(image || '/images/brand/social-card.png', window.location.origin).href
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`

    document.title = pageTitle
    setMeta('name', 'description', pageDescription)
    setMeta('property', 'og:title', pageTitle)
    setMeta('property', 'og:description', pageDescription)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:image', imageUrl)
    setMeta('property', 'og:image:alt', `${siteName} editorial portfolio`)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', pageTitle)
    setMeta('name', 'twitter:description', pageDescription)
    setMeta('name', 'twitter:image', imageUrl)
    setCanonical(canonicalUrl)
  }, [description, i18n.resolvedLanguage, image, t, title, type])

  return null
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function setCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }
  element.href = href
}
