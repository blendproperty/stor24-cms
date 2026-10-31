// Shared, dependency-free contract with the public website. No scripts or external destinations.
export const STATIC_PAGE_PATHS = ['/', '/micro-warehousing', '/personal-storage', '/business-storage', '/student-storage', '/moving-storage', '/storage-unit-sizes', '/space-guide', '/storage/midpoint', '/storage/melrose', '/contact', '/faq', '/blog', '/storage-insights', '/terms', '/privacy', '/paia'] as const
export const MANAGED_PAGE_PATHS = [...STATIC_PAGE_PATHS, '/micro-warehousing/midpoint'] as const
export type PageSeoRule = { path: string; canonicalPath?: string | null; noIndex?: boolean | null }
export type RedirectRule = { source: string; destination: string; statusCode: number }

export function pageSeoIssue(rows: PageSeoRule[]): string | null {
  const pages = new Map(rows.map(row => [row.path, row]))
  if (pages.size !== rows.length) return 'Each page can have only one search settings record.'
  for (const row of rows) {
    if (!(MANAGED_PAGE_PATHS as readonly string[]).includes(row.path)) return 'Choose an approved public page.'
    const canonical = row.canonicalPath || row.path
    if (!(MANAGED_PAGE_PATHS as readonly string[]).includes(canonical)) return 'Choose an approved STOR24 canonical page.'
    if (canonical === row.path) continue
    if (row.noIndex) return 'Use either search exclusion or another canonical page; clear one before publishing.'
    const target = pages.get(canonical)
    if (target?.noIndex) return 'The canonical page is excluded from search. Choose an indexable page.'
    if (target?.canonicalPath && target.canonicalPath !== canonical) return 'Choose a canonical page that points to itself, without a canonical chain.'
  }
  return null
}

export function normalizeRedirectPath(value: unknown): string | null {
  if (typeof value !== 'string') return null
  let path = value.trim()
  if (path.startsWith('https://stor24.co.za/')) {
    try { const url = new URL(path); if (url.origin !== 'https://stor24.co.za' || url.search || url.hash || url.username || url.password) return null; path = url.pathname } catch { return null }
  }
  if (!/^\/[A-Za-z0-9_/-]*(?:\.(?:html?|php|aspx))?$/.test(path) || path.includes('//') || (path.length > 1 && path.endsWith('/')) || path.length > 512) return null
  return path
}

const privatePath = /^\/(?:api|admin|account|profile|staff|login|pay|lease|my|sign|walk-in|thank-you|_next|brand|icons|images|fonts)(?:\/|$)/i
export function redirectPathIssue(value: unknown, kind: 'source' | 'destination'): string | null {
  const path = normalizeRedirectPath(value)
  if (!path) return 'Use a clean /page path or https://stor24.co.za/page, without queries, fragments or encoded paths.'
  const booking = /^\/book(?:\/|$)/i.test(path) || /^\/micro-warehousing\/book(?:\/|$)/i.test(path)
  if (privatePath.test(path) || (booking && (kind === 'source' || !['/book', '/micro-warehousing/book'].includes(path)))) return 'Private, payment, API, asset and protected booking paths cannot be managed here.'
  if (kind === 'source' && (path === '/terms/download' || (MANAGED_PAGE_PATHS as readonly string[]).some(page => page.toLowerCase() === path.toLowerCase()) || /^\/(?:pricing|locations|storage-near-me)(?:\/|$)/i.test(path))) return 'Keep current public pages and required legacy redirects intact. Use an old, retired page address.'
  return null
}

export function redirectGraphIssue(rows: RedirectRule[]): string | null {
  if (rows.length > 1000) return 'Review the redirect list before adding more than 1000 published rules.'
  const routes = new Map<string, string>()
  for (const row of rows) {
    const issue = redirectPathIssue(row.source, 'source') || redirectPathIssue(row.destination, 'destination')
    if (issue) return issue
    if (![301, 302, 307, 308].includes(row.statusCode)) return 'Choose a supported permanent or temporary redirect status.'
    const source = normalizeRedirectPath(row.source)!, destination = normalizeRedirectPath(row.destination)!
    if (routes.has(source)) return 'Each old page can have only one redirect.'
    routes.set(source, destination)
  }
  for (const start of routes.keys()) {
    const seen = new Set<string>(); let path: string | undefined = start
    while (path && routes.has(path)) {
      if (seen.has(path)) return 'This redirect creates a loop. Choose a final destination.'
      seen.add(path); path = routes.get(path)
      if (seen.size > 8) return 'Use a final destination instead of a redirect chain longer than eight steps.'
    }
  }
  return null
}
