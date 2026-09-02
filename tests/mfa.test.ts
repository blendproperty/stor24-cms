import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  consumeRecoveryCode,
  decryptMfaSecret,
  encryptMfaSecret,
  evaluateMfaLogin,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCodes,
  totpCode,
  verifyTotp,
} from '../src/lib/mfa'

process.env.PAYLOAD_SECRET ??= 'test-secret-at-least-32-characters-long'

test('generateTotpSecret produces a usable base32 secret that round-trips through verifyTotp', () => {
  const secret = generateTotpSecret()
  const now = Date.now()
  assert.ok(verifyTotp(secret, totpCode(secret, now), now))
})

test('verifyTotp accepts the previous and next 30s window but rejects codes further away', () => {
  const secret = generateTotpSecret()
  const now = Date.now()
  assert.ok(verifyTotp(secret, totpCode(secret, now - 30_000), now))
  assert.ok(verifyTotp(secret, totpCode(secret, now + 30_000), now))
  assert.equal(verifyTotp(secret, totpCode(secret, now - 90_000), now), false)
})

test('verifyTotp rejects malformed input without throwing', () => {
  const secret = generateTotpSecret()
  assert.equal(verifyTotp(secret, 'not-a-code'), false)
  assert.equal(verifyTotp(secret, '12345'), false)
})

test('encryptMfaSecret/decryptMfaSecret round-trip and reject tampering', () => {
  const secret = generateTotpSecret()
  const encrypted = encryptMfaSecret(secret)
  assert.equal(decryptMfaSecret(encrypted), secret)
  const tampered = encrypted.slice(0, -1) + (encrypted.at(-1) === 'A' ? 'B' : 'A')
  assert.throws(() => decryptMfaSecret(tampered))
})

test('recovery codes hash consistently and are consumed exactly once', () => {
  const codes = generateRecoveryCodes(4)
  assert.equal(codes.length, 4)
  const hashes = hashRecoveryCodes(codes)
  const remaining = consumeRecoveryCode(hashes, codes[1])
  assert.ok(remaining)
  assert.equal(remaining!.length, 3)
  // Using the same code again against the already-updated hash list fails.
  assert.equal(consumeRecoveryCode(remaining!, codes[1]), null)
  // An unrelated code never matches.
  assert.equal(consumeRecoveryCode(hashes, 'ZZZZZ-ZZZZZ'), null)
})

test('evaluateMfaLogin allows accounts without MFA enabled through unconditionally', () => {
  const result = evaluateMfaLogin({ mfaEnabled: false }, {})
  assert.deepEqual(result, { ok: true, usedRecoveryCode: false })
})

test('evaluateMfaLogin rejects an MFA-enabled account when no code is supplied', () => {
  const secret = generateTotpSecret()
  const result = evaluateMfaLogin(
    { mfaEnabled: true, mfaSecretEncrypted: encryptMfaSecret(secret), mfaRecoveryCodeHashes: [] },
    {},
  )
  assert.equal(result.ok, false)
})

test('evaluateMfaLogin accepts a correct TOTP code', () => {
  const secret = generateTotpSecret()
  const result = evaluateMfaLogin(
    { mfaEnabled: true, mfaSecretEncrypted: encryptMfaSecret(secret), mfaRecoveryCodeHashes: [] },
    { totp: totpCode(secret) },
  )
  assert.deepEqual(result, { ok: true, usedRecoveryCode: false })
})

test('evaluateMfaLogin rejects an incorrect TOTP code and does not fall through', () => {
  const secret = generateTotpSecret()
  const result = evaluateMfaLogin(
    { mfaEnabled: true, mfaSecretEncrypted: encryptMfaSecret(secret), mfaRecoveryCodeHashes: [] },
    { totp: '000000' },
  )
  assert.equal(result.ok, false)
})

test('evaluateMfaLogin accepts a valid recovery code and reports the reduced hash list', () => {
  const secret = generateTotpSecret()
  const codes = generateRecoveryCodes(3)
  const hashes = hashRecoveryCodes(codes)
  const result = evaluateMfaLogin(
    { mfaEnabled: true, mfaSecretEncrypted: encryptMfaSecret(secret), mfaRecoveryCodeHashes: hashes },
    { recoveryCode: codes[0] },
  )
  assert.equal(result.ok, true)
  assert.ok(result.ok && result.usedRecoveryCode)
  if (result.ok && result.usedRecoveryCode) {
    assert.equal(result.remainingRecoveryCodeHashes.length, 2)
  }
})

test('evaluateMfaLogin rejects a used-up or unknown recovery code', () => {
  const secret = generateTotpSecret()
  const result = evaluateMfaLogin(
    { mfaEnabled: true, mfaSecretEncrypted: encryptMfaSecret(secret), mfaRecoveryCodeHashes: [] },
    { recoveryCode: 'AAAAA-BBBBB' },
  )
  assert.equal(result.ok, false)
})

test('evaluateMfaLogin fails closed when mfaEnabled is set but the secret is missing', () => {
  const result = evaluateMfaLogin({ mfaEnabled: true, mfaSecretEncrypted: null }, { totp: '123456' })
  assert.equal(result.ok, false)
})
