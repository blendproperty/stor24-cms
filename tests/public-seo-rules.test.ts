import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeRedirectPath, redirectPathIssue, redirectGraphIssue, pageSeoIssue } from '../src/lib/public-seo-rules'

test('public redirect paths cannot escape the canonical host or protected flows', () => {
  assert.equal(normalizeRedirectPath('https://stor24.co.za/retired-page'), '/retired-page')
  for (const value of ['https://evil.example/a', '//evil.example/a', '/%2f%2fevil.example', '/a/../book', '/old?next=private', '/old#fragment', '/a\\b', 'javascript:alert(1)']) assert.ok(redirectPathIssue(value, 'source'), value)
  for (const value of ['/book', '/book/lease/token', '/api/booking/reservations', '/walk-in', '/pay/result', '/admin', '/', '/personal-storage', '/Personal-storage', '/terms/download', '/pricing', '/locations/anything']) assert.ok(redirectPathIssue(value, 'source'), value)
  for (const value of ['/api/posts', '/pay/result', '/book/lease/token', '/profile', '/walk-in']) assert.ok(redirectPathIssue(value, 'destination'), value)
  for (const value of ['/book', '/micro-warehousing/book', '/storage/midpoint', '/blog/new-article']) assert.equal(redirectPathIssue(value, 'destination'), null, value)
})

test('redirect graph permits useful chains but rejects loops, duplicates and unsupported statuses', () => {
  const a = { source: '/old-a', destination: '/old-b', statusCode: 308 }
  assert.equal(redirectGraphIssue([a, { source: '/old-b', destination: '/storage/midpoint', statusCode: 307 }]), null)
  assert.match(redirectGraphIssue([a, { source: '/old-b', destination: '/old-a', statusCode: 308 }])!, /loop/)
  assert.match(redirectGraphIssue([a, a])!, /only one/)
  assert.ok(redirectGraphIssue([{ ...a, destination: a.source }]))
  assert.ok(redirectGraphIssue([{ ...a, statusCode: 200 }]))
})

test('page canonicals stay on verified routes and cannot point to exclusions or chains', () => {
  assert.equal(pageSeoIssue([{ path: '/personal-storage', canonicalPath: '/business-storage' }]), null)
  assert.equal(pageSeoIssue([{ path: '/personal-storage', noIndex: true }]), null)
  assert.ok(pageSeoIssue([{ path: '/invented-branch' }]))
  assert.ok(pageSeoIssue([{ path: '/personal-storage', canonicalPath: 'https://evil.example/' }]))
  assert.ok(pageSeoIssue([{ path: '/personal-storage', canonicalPath: '/business-storage', noIndex: true }]))
  assert.ok(pageSeoIssue([{ path: '/personal-storage', canonicalPath: '/business-storage' }, { path: '/business-storage', noIndex: true }]))
  assert.ok(pageSeoIssue([{ path: '/personal-storage', canonicalPath: '/business-storage' }, { path: '/business-storage', canonicalPath: '/student-storage' }]))
})
