import * as Dialog from '@radix-ui/react-dialog'
import { ArrowUpRight, X } from 'lucide-react'

import './admin-login-dialog.css'

export function AdminLoginDialog() {
  return (
    <Dialog.Root>
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
            Authentication will be connected in the admin integration step.
          </Dialog.Description>
          <form className="login-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>Username</span>
              <input name="username" autoComplete="username" disabled />
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" autoComplete="current-password" disabled />
            </label>
            <button type="submit" disabled>
              Continue
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
