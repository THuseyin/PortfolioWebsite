import { useEffect } from 'react'

const siteName = 'Hüseyin Tepe'
const defaultDescription = 'Personal archive of software, writing, travel, and digital experiments.'

type PageMetaProps = {
  title?: string
  description?: string | null
  image?: string | null
  type?: 'website' | 'article'
}

export function PageMeta({ title, description, image, type = 'website' }: PageMetaProps) {
  useEffect(() => {
    const pageTitle = title ? `${title} — ${siteName}` : `${siteName} — Notes & Experiments`
    const pageDescription = description?.trim() || defaultDescription
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
  }, [description, image, title, type])

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
