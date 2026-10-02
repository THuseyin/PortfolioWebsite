import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Fragment, createElement, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'

import { articleQueries } from '../../features/articles/article-queries'
import { ApiError } from '../../lib/api-client'
import type { TiptapNode } from '../../types/article'
import './article-detail-page.css'

export function ArticleDetailPage() {
  const { slug } = useParams()
  const articleQuery = useQuery({
    ...articleQueries.detail(slug ?? ''),
    enabled: Boolean(slug),
  })

  if (!slug) {
    return <Navigate replace to="/articles" />
  }

  if (articleQuery.isPending) {
    return <ArticleDetailLoading />
  }

  if (articleQuery.isError) {
    const notFound = articleQuery.error instanceof ApiError && articleQuery.error.status === 404

    return (
      <ArticleDetailMessage
        title={notFound ? 'Note not found' : 'This note is unavailable'}
        message={
          notFound
            ? 'It may have moved, returned to draft, or never existed.'
            : 'The article could not be loaded. Check that the API is running and try again.'
        }
      />
    )
  }

  const article = articleQuery.data
  const publishedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(article.publishedAt))

  return (
    <article className="article-detail">
      <header className="article-detail__header">
        <div className="article-detail__meta">
          {article.category ? (
            <Link to={`/categories/${article.category.slug}`}>{article.category.name}</Link>
          ) : (
            <span>Uncategorized</span>
          )}
          <time dateTime={article.publishedAt}>{publishedDate}</time>
        </div>
        <h1>{article.title}</h1>
        {article.summary && <p className="article-detail__summary">{article.summary}</p>}
      </header>

      {article.headerImageUrl && (
        <figure className="article-detail__hero">
          <img src={article.headerImageUrl} alt={`Header visual for ${article.title}`} />
        </figure>
      )}

      <div className="article-detail__layout">
        <aside className="article-detail__aside">
          <p className="eyebrow">Filed under</p>
          <div className="article-detail__tags">
            {article.tags.length > 0
              ? article.tags.map((tag) => <span key={tag.id}>#{tag.name}</span>)
              : <span>No tags</span>}
          </div>
        </aside>
        <div className="article-prose">
          {article.content ? <TiptapContent document={article.content} /> : <p>No content yet.</p>}
        </div>
      </div>

      <footer className="article-detail__footer">
        <Link to="/articles"><ArrowLeft aria-hidden="true" /> All articles</Link>
        {article.category && (
          <Link to={`/categories/${article.category.slug}`}>
            More in {article.category.name} <ArrowUpRight aria-hidden="true" />
          </Link>
        )}
      </footer>
    </article>
  )
}

function TiptapContent({ document }: { document: TiptapNode }) {
  return <>{renderNodes(document.content ?? [], 'root')}</>
}

function renderNodes(nodes: TiptapNode[], path: string): ReactNode[] {
  return nodes.map((node, index) => renderNode(node, `${path}-${index}`))
}

function renderNode(node: TiptapNode, key: string): ReactNode {
  const children = renderNodes(node.content ?? [], key)

  switch (node.type) {
    case 'text':
      return <Fragment key={key}>{applyMarks(node.text ?? '', node.marks ?? [], key)}</Fragment>
    case 'paragraph':
      return <p key={key}>{children}</p>
    case 'heading': {
      const level = clampHeadingLevel(node.attrs?.level)
      return createElement(`h${level}`, { key }, children)
    }
    case 'bulletList':
      return <ul key={key}>{children}</ul>
    case 'orderedList':
      return <ol key={key} start={numberAttribute(node.attrs?.start)}>{children}</ol>
    case 'listItem':
      return <li key={key}>{children}</li>
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>
    case 'codeBlock':
      return <pre key={key}><code>{plainText(node)}</code></pre>
    case 'hardBreak':
      return <br key={key} />
    case 'horizontalRule':
      return <hr key={key} />
    case 'image': {
      const src = safeResourceUrl(node.attrs?.src)
      const title = stringAttribute(node.attrs?.title)
      if (!src) return null
      return (
        <figure className="article-prose__image" key={key}>
          <img src={src} alt={stringAttribute(node.attrs?.alt)} />
          {title && <figcaption>{title}</figcaption>}
        </figure>
      )
    }
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

function applyMarks(
  text: string,
  marks: NonNullable<TiptapNode['marks']>,
  key: string,
): ReactNode {
  return marks.reduce<ReactNode>((content, mark, index) => {
    const markKey = `${key}-mark-${index}`
    if (mark.type === 'bold') return <strong key={markKey}>{content}</strong>
    if (mark.type === 'italic') return <em key={markKey}>{content}</em>
    if (mark.type === 'strike') return <s key={markKey}>{content}</s>
    if (mark.type === 'code') return <code key={markKey}>{content}</code>
    if (mark.type === 'underline') return <u key={markKey}>{content}</u>
    if (mark.type === 'link') {
      const href = safeLinkUrl(mark.attrs?.href)
      if (!href) return content
      const external = /^https?:\/\//i.test(href)
      return (
        <a href={href} key={markKey} rel={external ? 'noreferrer' : undefined} target={external ? '_blank' : undefined}>
          {content}
        </a>
      )
    }
    return content
  }, text)
}

function safeLinkUrl(value: unknown) {
  if (typeof value !== 'string') return null
  return /^(?:https?:\/\/|mailto:|\/|#)/i.test(value) ? value : null
}

function safeResourceUrl(value: unknown) {
  if (typeof value !== 'string') return null
  return /^(?:https?:\/\/|\/)/i.test(value) ? value : null
}

function clampHeadingLevel(value: unknown): 2 | 3 | 4 | 5 | 6 {
  const level = typeof value === 'number' ? value : Number(value)
  return Math.min(6, Math.max(2, Number.isFinite(level) ? level : 2)) as 2 | 3 | 4 | 5 | 6
}

function numberAttribute(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function stringAttribute(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function plainText(node: TiptapNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(plainText).join('')
}

function ArticleDetailLoading() {
  return (
    <div className="article-detail-loading" aria-label="Loading article">
      <span />
      <span />
      <span />
    </div>
  )
}

function ArticleDetailMessage({ title, message }: { title: string; message: string }) {
  return (
    <section className="article-detail-message">
      <p className="eyebrow">Archive status</p>
      <h1>{title}</h1>
      <p>{message}</p>
      <Link to="/articles"><ArrowLeft aria-hidden="true" /> Return to all articles</Link>
    </section>
  )
}
