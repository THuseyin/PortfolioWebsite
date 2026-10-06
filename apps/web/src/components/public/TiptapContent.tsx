import { Fragment, createElement, type ReactNode } from 'react'

import type { TiptapNode } from '../../types/article'

export function TiptapContent({ document }: { document: TiptapNode }) {
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
    case 'bulletList': {
      const variant = bulletListVariant(node.attrs?.variant)
      return <ul className={`article-prose__list article-prose__list--${variant}`} data-list-style={variant} key={key}>{children}</ul>
    }
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
      const alignment = imageAlignment(node.attrs?.alignment)
      if (!src) return null
      return (
        <figure className={`article-prose__image article-prose__image--${alignment}`} key={key}>
          <img src={src} alt={stringAttribute(node.attrs?.alt)} />
          {title && <figcaption>{title}</figcaption>}
        </figure>
      )
    }
    default:
      return <Fragment key={key}>{children}</Fragment>
  }
}

function applyMarks(text: string, marks: NonNullable<TiptapNode['marks']>, key: string): ReactNode {
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
      return <a href={href} key={markKey} rel={external ? 'noreferrer' : undefined} target={external ? '_blank' : undefined}>{content}</a>
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

function imageAlignment(value: unknown): 'left' | 'center' | 'right' | 'wide' {
  return value === 'left' || value === 'right' || value === 'center' ? value : 'wide'
}

function bulletListVariant(value: unknown): 'disc' | 'square' | 'dash' {
  return value === 'square' || value === 'dash' ? value : 'disc'
}

function plainText(node: TiptapNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(plainText).join('')
}
