import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { uploadAdminImage } from '../../features/articles/admin-article-api'
import { homepageQueries, updateHomepage } from '../../features/homepage/homepage-api'
import { ApiError } from '../../lib/api-client'
import type { HomepageContent, UpdateHomepageInput } from '../../types/homepage'
import './admin-homepage-page.css'

export function AdminHomepagePage() {
  const query = useQuery(homepageQueries.admin())

  if (query.error instanceof ApiError && query.error.status === 401) {
    return <Navigate replace to="/?admin=login" />
  }

  if (query.isPending) return <main className="admin-homepage admin-homepage__state">Loading homepage…</main>
  if (query.isError) return <main className="admin-homepage admin-homepage__state">Homepage content could not be loaded.</main>

  return <HomepageForm initial={query.data} key={query.data.updatedAt} />
}

function HomepageForm({ initial }: { initial: HomepageContent }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<UpdateHomepageInput>(() => toInput(initial))
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(toInput(initial))

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => {
    if (feedback?.type !== 'success') return
    const timer = window.setTimeout(() => setFeedback(null), 3_500)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const saveMutation = useMutation({
    mutationFn: updateHomepage,
    onSuccess: (content) => {
      queryClient.setQueryData(homepageQueries.admin().queryKey, content)
      queryClient.setQueryData(homepageQueries.public().queryKey, content)
      setDraft(toInput(content))
      setFeedback({ type: 'success', message: 'Homepage updated.' })
    },
    onError: handleError,
  })

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File; index: number }) => uploadAdminImage(file),
    onSuccess: (image, variables) => {
      setDraft((current) => ({
        ...current,
        collageImages: current.collageImages.map((url, index) => index === variables.index ? image.url : url),
      }))
      setUploadingIndex(null)
    },
    onError: (error) => {
      setUploadingIndex(null)
      handleError(error)
    },
  })

  function handleError(error: Error) {
    if (error instanceof ApiError && error.status === 401) {
      navigate('/?admin=login', { replace: true })
      return
    }
    setFeedback({ type: 'error', message: error instanceof ApiError ? error.message : 'The action could not be completed.' })
  }

  function updateField<K extends keyof UpdateHomepageInput>(field: K, value: UpdateHomepageInput[K]) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function selectImage(index: number) {
    setUploadingIndex(index)
    fileInput.current?.click()
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || uploadingIndex === null) {
      setUploadingIndex(null)
      return
    }
    uploadMutation.mutate({ file, index: uploadingIndex })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    setFeedback(null)
    const invalidZone = draft.locations.find((location) => !isValidTimeZone(location.timeZone))
    if (invalidZone) {
      setFeedback({ type: 'error', message: `“${invalidZone.timeZone}” is not a valid IANA timezone.` })
      return
    }
    saveMutation.mutate(draft)
  }

  return (
    <main className="admin-homepage">
      <form onSubmit={submit}>
        <header className="admin-page-header admin-homepage__header">
          <div><p className="eyebrow">Site content / Homepage</p><h1>Homepage</h1></div>
          <button className="admin-primary-action" disabled={!dirty || saveMutation.isPending || uploadMutation.isPending} type="submit">
            <Save aria-hidden="true" /> {saveMutation.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </header>

        {feedback?.type === 'error' && <p className="admin-action-error" role="alert">{feedback.message}</p>}

        <div className="admin-homepage__layout">
          <div className="admin-homepage__fields">
            <EditorSection index="01" title="Hero">
              <Field label="Name"><input required maxLength={80} value={draft.name} onChange={(event) => updateField('name', event.target.value)} /></Field>
              <Field label="Eyebrow"><input required maxLength={120} value={draft.eyebrow} onChange={(event) => updateField('eyebrow', event.target.value)} /></Field>
              <Field label="Role"><input required maxLength={160} value={draft.role} onChange={(event) => updateField('role', event.target.value)} /></Field>
            </EditorSection>

            <EditorSection index="02" title="Personal note">
              <Field label="Headline"><textarea required rows={5} maxLength={240} value={draft.aboutHeadline} onChange={(event) => updateField('aboutHeadline', event.target.value)} /></Field>
              <Field label="Note"><textarea required rows={3} maxLength={400} value={draft.aboutNote} onChange={(event) => updateField('aboutNote', event.target.value)} /></Field>
              <div className="admin-homepage__field-row">
                <Field label="Currently"><input required maxLength={120} value={draft.currently} onChange={(event) => updateField('currently', event.target.value)} /></Field>
                <Field label="Interested in"><input required maxLength={180} value={draft.interests} onChange={(event) => updateField('interests', event.target.value)} /></Field>
              </div>
            </EditorSection>

            <EditorSection index="03" title="Instagram">
              <div className="admin-homepage__field-row">
                <Field label="Label"><input required maxLength={80} value={draft.instagramLabel} onChange={(event) => updateField('instagramLabel', event.target.value)} /></Field>
                <Field label="URL"><input required type="url" value={draft.instagramUrl} onChange={(event) => updateField('instagramUrl', event.target.value)} /></Field>
              </div>
            </EditorSection>

            <EditorSection index="04" title="Local times">
              <div className="admin-homepage__locations">
                {draft.locations.map((location, index) => (
                  <div className="admin-homepage__location" key={index}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <Field label="City"><input required maxLength={80} value={location.city} onChange={(event) => updateField('locations', draft.locations.map((item, itemIndex) => itemIndex === index ? { ...item, city: event.target.value } : item))} /></Field>
                    <Field label="IANA timezone"><input required placeholder="Europe/Berlin" value={location.timeZone} onChange={(event) => updateField('locations', draft.locations.map((item, itemIndex) => itemIndex === index ? { ...item, timeZone: event.target.value } : item))} /></Field>
                    <button aria-label={`Remove ${location.city}`} disabled={draft.locations.length === 1} type="button" onClick={() => updateField('locations', draft.locations.filter((_, itemIndex) => itemIndex !== index))}><Trash2 aria-hidden="true" /></button>
                  </div>
                ))}
              </div>
              <button className="admin-homepage__add" disabled={draft.locations.length >= 4} type="button" onClick={() => updateField('locations', [...draft.locations, { city: '', timeZone: '' }])}><Plus aria-hidden="true" /> Add location</button>
            </EditorSection>
          </div>

          <EditorSection className="admin-homepage__media" index="05" title="Moving collage">
            <p className="admin-homepage__hint">The homepage uses exactly 12 images across three moving rows.</p>
            <div className="admin-homepage__image-grid">
              {draft.collageImages.map((url, index) => (
                <button className="admin-homepage__image" disabled={uploadMutation.isPending} key={index} type="button" onClick={() => selectImage(index)}>
                  <img alt={`Collage slot ${index + 1}`} src={url} />
                  <span><ImagePlus aria-hidden="true" /> {uploadingIndex === index && uploadMutation.isPending ? 'Uploading…' : 'Replace'}</span>
                  <i>{String(index + 1).padStart(2, '0')}</i>
                </button>
              ))}
            </div>
            <input ref={fileInput} hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} />
          </EditorSection>
        </div>
      </form>

      {feedback?.type === 'success' && (
        <div className="admin-toast" role="status"><Check aria-hidden="true" /><span>{feedback.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setFeedback(null)}><X aria-hidden="true" /></button></div>
      )}
    </main>
  )
}

function EditorSection({ index, title, className = '', children }: { index: string; title: string; className?: string; children: React.ReactNode }) {
  return <section className={`admin-homepage__section ${className}`}><header><span>{index}</span><h2>{title}</h2></header><div>{children}</div></section>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="admin-homepage__field"><span>{label}</span>{children}</label>
}

function toInput(content: HomepageContent): UpdateHomepageInput {
  return {
    name: content.name,
    eyebrow: content.eyebrow,
    role: content.role,
    locations: content.locations,
    aboutHeadline: content.aboutHeadline,
    aboutNote: content.aboutNote,
    currently: content.currently,
    interests: content.interests,
    instagramLabel: content.instagramLabel,
    instagramUrl: content.instagramUrl,
    collageImages: content.collageImages,
  }
}

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en', { timeZone }).format()
    return true
  } catch {
    return false
  }
}
