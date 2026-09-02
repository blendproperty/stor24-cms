'use client'
import { useState } from 'react'

/**
 * Replaces the default Payload admin login form for accounts that have
 * two-step verification enabled. Payload's own `/admin/login` form only
 * collects email/password, and the `users` collection's `beforeLogin` hook
 * rejects any login that does not carry a verification code once
 * `mfaEnabled` is set — so an MFA-enabled account can only sign in through
 * this page, which posts to the `/api/users/custom-login` endpoint that
 * forwards the code via Payload's `context` option.
 *
 * Accounts without MFA enabled can still use this form (code left blank)
 * or the default `/admin/login` form; both call the same underlying
 * password check.
 */
export function CmsLoginForm() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)

  async function onSubmit(formData: FormData) {
    setBusy(true)
    setError('')
    const body: Record<string, string> = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    }
    const code = String(formData.get('code') ?? '').trim()
    if (code) {
      if (useRecoveryCode) body.recoveryCode = code
      else body.code = code
    }
    const response = await fetch('/api/users/custom-login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const payload = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) {
      setError(payload.error ?? 'Sign-in failed.')
      return
    }
    window.location.assign('/admin')
  }

  return (
    <form
      action={onSubmit}
      style={{ maxWidth: '360px', margin: '4rem auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Stor24 CMS sign-in</h1>
      <label>
        Email
        <input name="email" type="email" autoComplete="username" required style={{ display: 'block', width: '100%' }} />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required style={{ display: 'block', width: '100%' }} />
      </label>
      <label>
        {useRecoveryCode ? 'Recovery code' : 'Authenticator code (leave blank if two-step verification is off)'}
        <input
          name="code"
          autoComplete="one-time-code"
          inputMode={useRecoveryCode ? 'text' : 'numeric'}
          style={{ display: 'block', width: '100%' }}
        />
      </label>
      <button type="button" onClick={() => setUseRecoveryCode((value) => !value)} style={{ fontSize: '0.85rem', textAlign: 'left' }}>
        {useRecoveryCode ? 'Use authenticator code instead' : "Use a recovery code instead"}
      </button>
      <button type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      {error ? (
        <p role="status" style={{ color: '#b42318' }}>
          {error}
        </p>
      ) : null}
    </form>
  )
}
