import * as Dialog from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'

import { authQueries, loginAdmin } from '../../features/auth/auth-api'
import { ApiError } from '../../lib/api-client'
import './admin-login-dialog.css'

export function AdminLoginDialog() {
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
      setFormError('Enter both your username and password.')
      return
    }

    const adminWindow = window.open('about:blank', '_blank')
    if (!adminWindow) {
      setFormError('Allow pop-ups for this site, then try again.')
      return
    }
    adminWindow.opener = null

    try {
      const session = await loginMutation.mutateAsync({ username, password })
      queryClient.setQueryData(authQueries.session().queryKey, session)
      form.reset()
      handleOpenChange(false)
      adminWindow.location.href = '/admin'
    } catch (error) {
      adminWindow.close()
      setFormError(
        error instanceof ApiError && error.status === 401
          ? 'The username or password is incorrect.'
          : 'Admin login is unavailable. Please try again.',
      )
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button className="admin-trigger" type="button">
          Admin
          <ArrowUpRight aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="login-dialog">
          <div className="login-dialog__heading">
            <div>
              <p className="eyebrow">Restricted / 01</p>
              <Dialog.Title>Admin access</Dialog.Title>
            </div>
            <Dialog.Close className="dialog-close" aria-label="Close login dialog">
              <X aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description>
            Enter your private credentials to open the publishing workspace.
          </Dialog.Description>
          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              <span>Username</span>
              <input name="username" autoComplete="username" disabled={loginMutation.isPending} />
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" autoComplete="current-password" disabled={loginMutation.isPending} />
            </label>
            {formError && <p className="login-form__error" role="alert">{formError}</p>}
            <button type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Checking…' : 'Continue'}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
