export function contentSecurityPolicy(nonce?: string) {
  return [
    "default-src 'self'",
    `script-src 'self'${nonce ? ` 'nonce-${nonce}'` : ''}${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
    "script-src-attr 'none'", "object-src 'none'",
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:",
    "font-src 'self' data:", "connect-src 'self'", "worker-src 'self' blob:",
    "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'",
  ].join('; ')
}

export function pageSecurityHeaders(headers: Headers) {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))))
  const requestHeaders = new Headers(headers)
  requestHeaders.set('x-nonce', nonce)
  const policy = contentSecurityPolicy(nonce)
  requestHeaders.set('content-security-policy', policy)
  return { requestHeaders, policy }
}
