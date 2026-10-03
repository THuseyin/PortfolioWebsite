import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import { authQueries, loginAdmin } from '../../features/auth/auth-api'
import { ApiError } from '../../lib/api-client'
import './admin-login-dialog.css'

export function AdminLoginDialog() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(searchParams.get('admin') === 'login')
  const [formError, setFormError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const loginMutation = useMutation({ mutationFn: loginAdmin })

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    setFormError(null)

    if (!nextOpen && searchParams.has('admin')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('admin')
      setSearchParams(nextParams, { replace: true })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const username = String(formData.get('username') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!username || !password) {
      setFormError(t('login.missing'))
      return
    }

    try {
      const session = await loginMutation.mutateAsync({ username, password })
      queryClient.setQueryData(authQueries.session().queryKey, session)

      const adminWindow = window.open('/admin', '_blank')
      if (!adminWindow) {
        setFormError(t('login.popup'))
        return
      }
      adminWindow.opener = null

      form.reset()
      handleOpenChange(false)
    } catch (error) {
      setFormError(
        error instanceof ApiError && error.status === 401
          ? t('login.incorrect')
          : t('login.unavailable'),
      )
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className="admin-trigger" type="button">
          {t('login.trigger')}
          <ArrowUpRight aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="login-dialog">
          <div className="login-dialog__heading">
            <div>
              <p className="eyebrow">{t('login.eyebrow')}</p>
              <Dialog.Title>{t('login.title')}</Dialog.Title>
            </div>
            <Dialog.Close className="dialog-close" aria-label={t('login.close')}>
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description>
            {t('login.description')}
          </Dialog.Description>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('login.username')}</span>
              <input name="username" autoComplete="username" disabled={loginMutation.isPending} />
            </label>
            <label>
              <span>{t('login.password')}</span>
              <input name="password" type="password" autoComplete="current-password" disabled={loginMutation.isPending} />
            </label>
            {formError && <p className="login-form__error" role="alert">{formError}</p>}
            <button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? t('login.checking') : t('login.continue')}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
