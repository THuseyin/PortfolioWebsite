import Image from '@tiptap/extension-image'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Bold, Code2, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, Save, Undo2, Unlink } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link, Navigate, useBlocker, useNavigate, useParams } from 'react-router'

import {
  adminArticleQueries,
  createAdminArticle,
  publishAdminArticle,
  unpublishAdminArticle,
  updateAdminArticle,
  uploadAdminImage,
  type AdminArticleDetail,
  type UpdateAdminArticleInput,
} from '../../features/articles/admin-article-api'
import { categoryQueries } from '../../features/categories/category-queries'
import { tagQueries } from '../../features/tags/tag-queries'
import { ApiError } from '../../lib/api-client'
import './admin-article-editor-page.css'

const emptyDocument = { type: 'doc', content: [{ type: 'paragraph' }] }

export function AdminArticleEditorPage() {
  const { articleId } = useParams()
  return articleId ? <ExistingArticleEditor articleId={articleId} /> : <CreateArticleRedirect />
}

function CreateArticleRedirect() {
  const navigate = useNavigate()
  const started = useRef(false)
  const createMutation = useMutation({
    mutationFn: createAdminArticle,
    onSuccess: (article) => navigate(`/admin/articles/${article.id}/edit`, { replace: true }),
  })

  useEffect(() => {
    if (!started.current) {
      started.current = true
      createMutation.mutate()
    }
  }, [createMutation])

  if (createMutation.isError) {
    return <EditorMessage title="Draft could not be created" message={errorMessage(createMutation.error)} />
  }
  return <div className="admin-editor-loading">Creating a new draft…</div>
}

function ExistingArticleEditor({ articleId }: { articleId: string }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const articleQuery = useQuery(adminArticleQueries.detail(articleId))
  const categoriesQuery = useQuery(categoryQueries.all())
  const tagsQuery = useQuery(tagQueries.all())
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tagIds, setTagIds] = useState<string[]>([])
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)
  const initializedArticleId = useRef<string | null>(null)
  const headerInputRef = useRef<HTMLInputElement>(null)
  const inlineInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image.configure({ allowBase64: false })],
    content: emptyDocument,
    editorProps: { attributes: { class: 'admin-tiptap__content', 'aria-label': 'Article content' } },
    onUpdate: () => setDirty(true),
  })
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    dirty && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    const article = articleQuery.data
    if (!article || !editor || initializedArticleId.current === article.id) return
    initializedArticleId.current = article.id
    setTitle(article.title)
    setSummary(article.summary ?? '')
    setCategoryId(article.category?.id ?? '')
    setTagIds(article.tags.map((tag) => tag.id))
    setHeaderImageUrl(article.headerImageUrl)
    editor.commands.setContent(article.content ?? emptyDocument, { emitUpdate: false })
    setDirty(false)
  }, [articleQuery.data, editor])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('Discard unsaved changes and leave the editor?')) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  const handleAuthError = (error: Error) => {
    if (error instanceof ApiError && error.status === 401) {
      navigate('/?admin=login', { replace: true })
      return true
    }
    return false
  }

  const saveMutation = useMutation({
    mutationFn: (input: UpdateAdminArticleInput) => updateAdminArticle(articleId, input),
    onSuccess: (article) => {
      queryClient.setQueryData(adminArticleQueries.detail(articleId).queryKey, article)
      queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] })
      setDirty(false)
      setFeedback({ type: 'success', message: 'Draft saved.' })
    },
    onError: (error) => {
      if (!handleAuthError(error)) setFeedback({ type: 'error', message: errorMessage(error) })
    },
  })
  const publishMutation = useMutation({
    mutationFn: publishAdminArticle,
    onSuccess: updateArticleCache,
    onError: (error) => {
      if (!handleAuthError(error)) setFeedback({ type: 'error', message: errorMessage(error) })
    },
  })
  const unpublishMutation = useMutation({
    mutationFn: unpublishAdminArticle,
    onSuccess: updateArticleCache,
    onError: (error) => {
      if (!handleAuthError(error)) setFeedback({ type: 'error', message: errorMessage(error) })
    },
  })
  const headerUploadMutation = useMutation({
    mutationFn: uploadAdminImage,
    onSuccess: (image) => {
      setHeaderImageUrl(image.url)
      setDirty(true)
      setFeedback({ type: 'success', message: 'Header image uploaded. Save the draft to attach it.' })
    },
    onError: (error) => {
      if (!handleAuthError(error)) setFeedback({ type: 'error', message: errorMessage(error) })
    },
  })
  const inlineUploadMutation = useMutation({
    mutationFn: uploadAdminImage,
    onSuccess: (image) => {
      editor?.chain().focus().setImage({ src: image.url }).run()
      setFeedback({ type: 'success', message: 'Image inserted into the article.' })
    },
    onError: (error) => {
      if (!handleAuthError(error)) setFeedback({ type: 'error', message: errorMessage(error) })
    },
  })

  function updateArticleCache(article: AdminArticleDetail) {
    queryClient.setQueryData(adminArticleQueries.detail(articleId).queryKey, article)
    queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] })
    setFeedback({ type: 'success', message: article.status === 'PUBLISHED' ? 'Article published.' : 'Article returned to draft.' })
  }

  const createInput = (): UpdateAdminArticleInput => ({
    title: title.trim() || 'Untitled',
    summary: summary.trim() || null,
    headerImageUrl,
    content: (editor?.getJSON() as Record<string, unknown> | undefined) ?? null,
    categoryId: categoryId || null,
    tagIds,
  })

  const save = () => {
    setFeedback(null)
    return saveMutation.mutateAsync(createInput())
  }

  const handlePublish = async () => {
    setFeedback(null)
    try {
      await save()
      await publishMutation.mutateAsync(articleId)
    } catch {
      // The relevant mutation exposes its API error in the feedback region.
    }
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>, placement: 'header' | 'inline') => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFeedback(null)
    if (placement === 'header') headerUploadMutation.mutate(file)
    else inlineUploadMutation.mutate(file)
  }

  if (articleQuery.error instanceof ApiError && articleQuery.error.status === 401) {
    return <Navigate replace to="/?admin=login" />
  }
  if (articleQuery.isPending || !editor) return <div className="admin-editor-loading">Loading editor…</div>
  if (articleQuery.isError) return <EditorMessage title="Article unavailable" message={errorMessage(articleQuery.error)} />

  const article = articleQuery.data
  const busy = saveMutation.isPending || publishMutation.isPending || unpublishMutation.isPending

  return (
    <main className="admin-editor">
      <header className="admin-editor__header">
        <div>
          <Link to="/admin/articles"><ArrowLeft aria-hidden="true" /> Articles</Link>
          <p className="eyebrow">{article.status} / {dirty ? 'Unsaved changes' : 'Up to date'}</p>
        </div>
        <div className="admin-editor__actions">
          <button type="button" disabled={busy} onClick={() => save()}><Save aria-hidden="true" /> Save draft</button>
          {article.status === 'DRAFT' ? (
            <button className="admin-editor__publish" type="button" disabled={busy} onClick={handlePublish}>Publish</button>
          ) : (
            <button type="button" disabled={busy} onClick={() => unpublishMutation.mutate(articleId)}>Unpublish</button>
          )}
        </div>
      </header>

      {feedback && <p className={`admin-editor__feedback admin-editor__feedback--${feedback.type}`} role="status">{feedback.message}</p>}

      <div className="admin-editor__grid">
        <section className="admin-editor__main">
          <label className="admin-editor__title-field">
            <span>Title</span>
            <textarea maxLength={200} value={title} rows={2} onChange={(event) => { setTitle(event.target.value); setDirty(true) }} />
          </label>
          <label className="admin-editor__summary-field">
            <span>Summary</span>
            <textarea maxLength={500} rows={3} value={summary} onChange={(event) => { setSummary(event.target.value); setDirty(true) }} />
            <small>{summary.length} / 500</small>
          </label>

          <div className="admin-tiptap">
            <EditorToolbar editor={editor} imageBusy={inlineUploadMutation.isPending} onImage={() => inlineInputRef.current?.click()} />
            <EditorContent editor={editor} />
          </div>
        </section>

        <aside className="admin-editor__sidebar">
          <section>
            <div className="admin-editor__section-heading"><span>Header image</span></div>
            {headerImageUrl ? <img className="admin-editor__cover" src={headerImageUrl} alt="Article header preview" /> : <div className="admin-editor__cover-placeholder">No image selected</div>}
            <button type="button" disabled={headerUploadMutation.isPending} onClick={() => headerInputRef.current?.click()}>
              <ImagePlus aria-hidden="true" /> {headerUploadMutation.isPending ? 'Uploading…' : 'Upload image'}
            </button>
            {headerImageUrl && <button className="admin-editor__text-button" type="button" onClick={() => { setHeaderImageUrl(null); setDirty(true) }}>Remove image</button>}
          </section>

          <section>
            <label>
              <span>Category</span>
              <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setDirty(true) }}>
                <option value="">No category</option>
                {categoriesQuery.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          </section>

          <section>
            <div className="admin-editor__section-heading"><span>Tags</span><small>{tagIds.length} selected</small></div>
            <div className="admin-editor__tag-list">
              {tagsQuery.data?.map((tag) => (
                <label key={tag.id}>
                  <input type="checkbox" checked={tagIds.includes(tag.id)} onChange={(event) => {
                    setTagIds((current) => event.target.checked ? [...current, tag.id] : current.filter((id) => id !== tag.id))
                    setDirty(true)
                  }} />
                  <span>#{tag.name}</span>
                </label>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <input ref={headerInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => handleFile(event, 'header')} />
      <input ref={inlineInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => handleFile(event, 'inline')} />
    </main>
  )
}

function EditorToolbar({ editor, imageBusy, onImage }: { editor: Editor; imageBusy: boolean; onImage: () => void }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const href = window.prompt('Link URL', previous ?? 'https://')
    if (href === null) return
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run()
  }

  return (
    <div className="admin-tiptap__toolbar" aria-label="Formatting toolbar">
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo2 /></ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo2 /></ToolbarButton>
      <span />
      <ToolbarButton active={editor.isActive('heading', { level: 2 })} label="Heading" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolbarButton>
      <ToolbarButton active={editor.isActive('bold')} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></ToolbarButton>
      <ToolbarButton active={editor.isActive('italic')} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></ToolbarButton>
      <ToolbarButton active={editor.isActive('code')} label="Inline code" onClick={() => editor.chain().focus().toggleCode().run()}><Code2 /></ToolbarButton>
      <ToolbarButton active={editor.isActive('bulletList')} label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></ToolbarButton>
      <ToolbarButton active={editor.isActive('orderedList')} label="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
      <ToolbarButton active={editor.isActive('blockquote')} label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></ToolbarButton>
      <ToolbarButton active={editor.isActive('link')} label="Link" onClick={setLink}><Link2 /></ToolbarButton>
      <ToolbarButton label="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}><Unlink /></ToolbarButton>
      <ToolbarButton disabled={imageBusy} label="Insert image" onClick={onImage}><ImagePlus /></ToolbarButton>
    </div>
  )
}

function ToolbarButton({ active = false, children, disabled = false, label, onClick }: { active?: boolean; children: ReactNode; disabled?: boolean; label: string; onClick: () => void }) {
  return <button className={active ? 'is-active' : undefined} type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick}>{children}</button>
}

function EditorMessage({ title, message }: { title: string; message: string }) {
  return <section className="admin-editor-message"><h1>{title}</h1><p>{message}</p><Link to="/admin/articles">Return to articles</Link></section>
}

function errorMessage(error: Error) {
  return error instanceof ApiError ? error.message : 'The request could not be completed.'
}
