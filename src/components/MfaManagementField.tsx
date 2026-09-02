'use client'
import { useAuth, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

type Status = { enabled: boolean; recoveryCodesRemaining: number }

/**
 * Self-service two-step verification management, rendered as a UI field on
 * the `users` collection edit view (which Payload also uses for the
 * account/"my profile" page). Only the currently signed-in user may act on
 * their own credential — editing another user's document shows read-only
 * status, since MFA enrollment is always self-service.
 */
export function MfaManagementField() {
  const { user } = useAuth()
  const { id: editedDocId } = useDocumentInfo()
  const [status, setStatus] = useState<Status | null>(null)
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null)
  const [codes, setCodes] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const isOwnAccount = Boolean(user && editedDocId !== undefined && String(user.id) === String(editedDocId))

  useEffect(() => {
    if (!isOwnAccount) return
    let active = true
    fetch('/api/users/mfa')
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (active && ok) setStatus(payload)
      })
    return () => {
      active = false
    }
  }, [isOwnAccount])

  async function call(path: string, body: Record<string, unknown> = {}) {
    setBusy(true)
    setMessage('')
    const response = await fetch(`/api/users/${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) {
      setMessage(payload.error ?? 'The security setting could not be changed.')
      return null
    }
    return payload
  }

  async function begin() {
    const data = await call('mfa/begin')
    if (data) {
      setSetup(data)
      setCodes([])
      setMessage('Add this account to your authenticator app, then verify one code below.')
    }
  }

  async function enable(formData: FormData) {
    const data = await call('mfa/enable', { code: formData.get('code') })
    if (data) {
      setCodes(data.recoveryCodes)
      setSetup(null)
      setStatus({ enabled: true, recoveryCodesRemaining: data.recoveryCodes.length })
      setMessage('Two-step verification is enabled. Save the recovery codes now; they will not be shown again.')
    }
  }

  async function regenerate(formData: FormData) {
    const data = await call('mfa/regenerate', { code: formData.get('code') })
    if (data) {
      setCodes(data.recoveryCodes)
      setMessage('New recovery codes created. All previous codes are now invalid.')
    }
  }

  async function disable(formData: FormData) {
    const data = await call('mfa/disable', { code: formData.get('code'), password: formData.get('password') })
    if (data) window.location.assign('/cms-login')
  }

  if (!isOwnAccount) {
    return <p>Two-step verification is managed by each user for their own account.</p>
  }
  if (!status) return <p>Loading account security…</p>

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
      <strong>{status.enabled ? 'Two-step verification is on' : 'Two-step verification is off'}</strong>
      <p>{status.enabled ? `${status.recoveryCodesRemaining} unused recovery codes remain.` : 'Add an authenticator app before requiring a second step at sign-in.'}</p>
      {!status.enabled && !setup ? (
        <button type="button" disabled={busy} onClick={begin}>
          Set up authenticator
        </button>
      ) : null}
      {setup ? (
        <form action={enable} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p>
            <strong>1. Add an account manually</strong>
          </p>
          <p>In Microsoft Authenticator, Google Authenticator or 1Password, choose to enter a setup key.</p>
          <code>{setup.secret}</code>
          <details>
            <summary>Advanced: copy authenticator URI</summary>
            <code>{setup.uri}</code>
          </details>
          <label>
            <strong>2. Verify the 6-digit code</strong>
            <input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required />
          </label>
          <button disabled={busy} type="submit">
            Verify and enable
          </button>
        </form>
      ) : null}
      {status.enabled ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
          <form action={regenerate} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <label>
              Authenticator or recovery code
              <input name="code" autoComplete="one-time-code" required />
            </label>
            <button disabled={busy} type="submit">
              Create new recovery codes
            </button>
          </form>
          <form action={disable} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <label>
              Current password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <label>
              Authenticator or recovery code
              <input name="code" autoComplete="one-time-code" required />
            </label>
            <button disabled={busy} type="submit">
              Turn off two-step verification
            </button>
          </form>
        </div>
      ) : null}
      {codes.length ? (
        <div style={{ marginTop: '0.75rem' }}>
          <strong>Recovery codes — shown once</strong>
          <pre>{codes.join('\n')}</pre>
        </div>
      ) : null}
      {message ? <p role="status">{message}</p> : null}
    </div>
  )
}

export default MfaManagementField
