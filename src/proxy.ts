import { NextResponse, type NextRequest } from 'next/server'
import { pageSecurityHeaders } from './content-security-policy'

export function proxy(request: NextRequest) {
  const { requestHeaders, policy } = pageSecurityHeaders(request.headers)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('content-security-policy', policy)
  response.headers.set('cache-control', 'private, no-store')
  return response
}

export const config = { matcher: ['/((?!api/|_next/static|_next/image|favicon.ico).*)'] }
