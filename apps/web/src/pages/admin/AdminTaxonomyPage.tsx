import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { categoryQueries } from '../../features/categories/category-queries'
import { tagQueries } from '../../features/tags/tag-queries'
import {
  createTaxonomyItem,
  deleteTaxonomyItem,
  updateTaxonomyItem,
  type TaxonomyItem,
  type TaxonomyKind,
} from '../../features/taxonomy/admin-taxonomy-api'
import { ApiError } from '../../lib/api-client'
import './admin-taxonomy-page.css'

export function AdminTaxonomyPage({ kind }: { kind: TaxonomyKind }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const query = useQuery(kind === 'categories' ? categoryQueries.all() : tagQueries.all())
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<TaxonomyItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaxonomyItem | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)
  const singular = kind === 'categories' ? 'category' : 'tag'
  const title = kind === 'categories' ? 'Categories' : 'Tags'
  const queryKey = kind === 'categories' ? ['categories'] : ['tags']

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey })
    queryClient.invalidateQueries({ queryKey: ['articles'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] })
  }

  const handleError = (error: Error) => {
    if (error instanceof ApiError && error.status === 401) {
      navigate('/?admin=login', { replace: true })
      return
    }
    setFeedback({ type: 'error', message: error instanceof ApiError ? error.message : 'The action could not be completed.' })
  }

  const createMutation = useMutation({
    mutationFn: (name: string) => createTaxonomyItem(kind, name),
    onSuccess: () => {
      refresh()
      setCreateOpen(false)
      setFeedback({ type: 'success', message: `${capitalize(singular)} created.` })
    },
    onError: handleError,
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, name, slug }: TaxonomyItem) => updateTaxonomyItem(kind, id, { name, slug }),
    onSuccess: () => {
      refresh()
      setEditing(null)
      setFeedback({ type: 'success', message: `${capitalize(singular)} updated.` })
    },
    onError: handleError,
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTaxonomyItem(kind, id),
    onSuccess: () => {
      refresh()
      setDeleteTarget(null)
      setFeedback({ type: 'success', message: `${capitalize(singular)} deleted.` })
    },
    onError: handleError,
  })

  useEffect(() => {
    if (feedback?.type !== 'success') return
    const timer = window.setTimeout(() => setFeedback(null), 3_500)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const items = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return query.data ?? []
    return (query.data ?? []).filter((item) =>
      item.name.toLowerCase().includes(normalized) || item.slug.includes(normalized),
    )
  }, [query.data, search])

  if (query.error instanceof ApiError && query.error.status === 401) {
    return <Navigate replace to="/?admin=login" />
  }

  return (
    <main className="admin-taxonomy">
      <header className="admin-page-header">
        <div><p className="eyebrow">Publishing / Taxonomy</p><h1>{title}</h1></div>
        <div className="admin-taxonomy__header-actions">
          <span className="admin-taxonomy__count">{String(query.data?.length ?? 0).padStart(2, '0')} total</span>
          <button className="admin-primary-action" type="button" onClick={() => { setFeedback(null); setCreateOpen(true) }}>
            <Plus aria-hidden="true" /> New {singular}
          </button>
        </div>
      </header>

      <section className="admin-taxonomy__controls">
        <label className="admin-taxonomy__search">
          <span>Filter</span>
          <div><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${kind}`} /></div>
        </label>
      </section>

      {feedback?.type === 'error' && <p className="admin-action-error" role="alert">{feedback.message}</p>}

      <section className="admin-taxonomy__list" aria-label={title}>
        <div className="admin-taxonomy__heading"><span>Name</span><span>Slug</span><span>Actions</span></div>
        {query.isPending && <div className="admin-taxonomy__loading">Loading {kind}…</div>}
        {query.isError && <div className="admin-taxonomy__empty">The {kind} could not be loaded.</div>}
        {query.isSuccess && items.length === 0 && <div className="admin-taxonomy__empty">No {kind} match this filter.</div>}
        {items.map((item) => (
          <article className="admin-taxonomy__row" key={item.id}>
            <strong>{item.name}</strong>
            <code>{item.slug}</code>
            <div>
              <button type="button" title={`Edit ${singular}`} onClick={() => { setFeedback(null); setEditing(item) }}><Pencil aria-hidden="true" /><span>Edit</span></button>
              <button type="button" title={`Delete ${singular}`} onClick={() => { setFeedback(null); setDeleteTarget(item) }}><Trash2 aria-hidden="true" /><span>Delete</span></button>
            </div>
          </article>
        ))}
      </section>

      {createOpen && (
        <CreateTaxonomyDialog
          key={kind}
          kind={singular}
          saving={createMutation.isPending}
          onCancel={() => setCreateOpen(false)}
          onCreate={(name) => createMutation.mutate(name)}
        />
      )}
      {editing && (
        <EditTaxonomyDialog key={editing.id} item={editing} kind={singular} saving={updateMutation.isPending} onCancel={() => setEditing(null)} onSave={(item) => updateMutation.mutate(item)} />
      )}
      <DeleteTaxonomyDialog item={deleteTarget} kind={singular} deleting={deleteMutation.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} />

      {feedback?.type === 'success' && (
        <div className="admin-toast" role="status"><Check aria-hidden="true" /><span>{feedback.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setFeedback(null)}><X aria-hidden="true" /></button></div>
      )}
    </main>
  )
}

function CreateTaxonomyDialog({ kind, saving, onCancel, onCreate }: { kind: string; saving: boolean; onCancel: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('')

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !saving) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-confirm-overlay" />
        <Dialog.Content className="admin-taxonomy-dialog">
          <div className="admin-confirm-dialog__index"><span className="eyebrow">New {kind}</span><Dialog.Close disabled={saving} aria-label="Close creator"><X aria-hidden="true" /></Dialog.Close></div>
          <Dialog.Title>Create {kind}</Dialog.Title>
          <Dialog.Description>The public slug will be generated automatically from the name.</Dialog.Description>
          <form onSubmit={(event: FormEvent) => { event.preventDefault(); if (name.trim()) onCreate(name.trim()) }}>
            <label><span>Name</span><input autoFocus maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} placeholder={`${capitalize(kind)} name`} /></label>
            <div><Dialog.Close disabled={saving}>Cancel</Dialog.Close><button disabled={saving || !name.trim()} type="submit">{saving ? 'Creating…' : `Create ${kind}`}</button></div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function EditTaxonomyDialog({ item, kind, saving, onCancel, onSave }: { item: TaxonomyItem; kind: string; saving: boolean; onCancel: () => void; onSave: (item: TaxonomyItem) => void }) {
  const [name, setName] = useState(item.name)
  const [slug, setSlug] = useState(item.slug)

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !saving) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-confirm-overlay" />
        <Dialog.Content className="admin-taxonomy-dialog">
          <div className="admin-confirm-dialog__index"><span className="eyebrow">Edit {kind}</span><Dialog.Close disabled={saving} aria-label="Close editor"><X aria-hidden="true" /></Dialog.Close></div>
          <Dialog.Title>Update {kind}</Dialog.Title>
          <Dialog.Description>Names are public. Changing the slug also changes its public URL.</Dialog.Description>
          <form onSubmit={(event) => { event.preventDefault(); if (item) onSave({ ...item, name: name.trim(), slug: slug.trim().toLowerCase() }) }}>
            <label><span>Name</span><input maxLength={80} required value={name} onChange={(event) => setName(event.target.value)} /></label>
            <label><span>Slug</span><input maxLength={120} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
            <div><Dialog.Close disabled={saving}>Cancel</Dialog.Close><button disabled={saving || !name.trim() || !slug.trim()} type="submit">{saving ? 'Saving…' : 'Save changes'}</button></div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function DeleteTaxonomyDialog({ item, kind, deleting, onCancel, onConfirm }: { item: TaxonomyItem | null; kind: string; deleting: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Dialog.Root open={Boolean(item)} onOpenChange={(open) => { if (!open && !deleting) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-confirm-overlay" />
        <Dialog.Content className="admin-confirm-dialog">
          <div className="admin-confirm-dialog__index"><span className="eyebrow">Destructive action</span><Dialog.Close disabled={deleting} aria-label="Close delete confirmation"><X aria-hidden="true" /></Dialog.Close></div>
          <Dialog.Title>Delete this {kind}?</Dialog.Title>
          <Dialog.Description>“{item?.name}” will be permanently removed. Assigned {kind}s cannot be deleted.</Dialog.Description>
          <div className="admin-confirm-dialog__actions"><Dialog.Close disabled={deleting}>Keep {kind}</Dialog.Close><button type="button" disabled={deleting} onClick={onConfirm}>{deleting ? 'Deleting…' : 'Delete permanently'}</button></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
