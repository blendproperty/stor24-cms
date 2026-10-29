import assert from 'node:assert/strict'
import test from 'node:test'
import { NextRequest } from 'next/server'
import { pageSecurityHeaders, contentSecurityPolicy } from '../src/content-security-policy'
import { proxy } from '../src/proxy'
import { DateTimeResolver, EmailAddressResolver, PhoneNumberResolver } from 'graphql-scalars'

test('CMS page CSP replaces injected headers and forwards a fresh nonce to rendering', () => {
  const request = new NextRequest('https://cms.example.invalid/admin/login', { headers: { 'x-nonce': 'attacker', 'content-security-policy': "script-src * 'unsafe-inline'" } })
  const response = proxy(request)
  const second = pageSecurityHeaders(new Headers())
  const policy = response.headers.get('content-security-policy')!
  assert.equal(response.headers.get('x-middleware-request-content-security-policy'), policy)
  assert.notEqual(response.headers.get('x-middleware-request-x-nonce'), second.requestHeaders.get('x-nonce'))
  assert.match(policy, /script-src-attr 'none'/)
  assert.match(policy, /object-src 'none'/)
  assert.doesNotMatch(policy.split(';').find(value => value.trim().startsWith('script-src '))!, /unsafe-inline|attacker/)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.doesNotMatch(contentSecurityPolicy(), /nonce-/)
})

test('patched GraphQL scalars preserve the two Payload consumers and reject a hostile phone value promptly', { timeout: 2000 }, () => {
  assert.equal(EmailAddressResolver.parseValue('editor@example.invalid'), 'editor@example.invalid')
  assert.equal(DateTimeResolver.serialize(new Date('2026-10-29T00:00:00Z')).toISOString(), '2026-10-29T00:00:00.000Z')
  assert.throws(() => PhoneNumberResolver.parseValue('1'.repeat(10000) + 'x'))
})
