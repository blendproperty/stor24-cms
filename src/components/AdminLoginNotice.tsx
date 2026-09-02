import React from 'react'

/**
 * Rendered under Payload's default email/password login form via
 * `admin.components.afterLogin`. The default form has no field for a
 * verification code, so an account with two-step verification enabled
 * cannot complete login here — it must use /cms-login instead, which posts
 * to the MFA-aware /api/users/custom-login endpoint.
 */
export function AdminLoginNotice() {
  return (
    <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
      Two-step verification enabled? <a href="/cms-login">Sign in here</a> instead.
    </p>
  )
}

export default AdminLoginNotice
