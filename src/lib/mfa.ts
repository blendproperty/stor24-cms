import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

// Same zero-dependency TOTP/recovery-code implementation used by the CRM
// (blendproperty/stor24-portal `src/lib/mfa.ts`), ported so the CMS admin
// surface has its own independent MFA credential rather than sharing one
// with the CRM. See PROJECT_CONTEXT.md "CMS administrator MFA".

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function encryptionKey() {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret || secret.length < 32) throw new Error('PAYLOAD_SECRET must be at least 32 characters.')
  return createHash('sha256').update(`stor24-cms:mfa:encryption:${secret}`).digest()
}

export function generateTotpSecret(bytes = 20) {
  const input = randomBytes(bytes)
  let bits = ''
  for (const value of input) bits += value.toString(2).padStart(8, '0')
  let output = ''
  for (let index = 0; index < bits.length; index += 5) {
    output += BASE32[Number.parseInt(bits.slice(index, index + 5).padEnd(5, '0'), 2)]
  }
  return output
}

function decodeBase32(value: string) {
  const clean = value.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const character of clean) {
    const index = BASE32.indexOf(character)
    if (index < 0) throw new Error('Invalid base32 secret.')
    bits += index.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2))
  }
  return Buffer.from(bytes)
}

export function totpCode(secret: string, time = Date.now(), digits = 6) {
  const counter = Math.floor(time / 30_000)
  const message = Buffer.alloc(8)
  message.writeBigUInt64BE(BigInt(counter))
  const digest = createHmac('sha1', decodeBase32(secret)).update(message).digest()
  const offset = digest[digest.length - 1] & 0x0f
  const value = (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits
  return value.toString().padStart(digits, '0')
}

export function verifyTotp(secret: string, code: string, time = Date.now()) {
  const candidate = code.replace(/\s/g, '')
  if (!/^\d{6}$/.test(candidate)) return false
  return [-1, 0, 1].some((window) => {
    const expected = totpCode(secret, time + window * 30_000)
    return timingSafeEqual(Buffer.from(candidate), Buffer.from(expected))
  })
}

export function encryptMfaSecret(secret: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.')
}

export function decryptMfaSecret(value: string) {
  const [version, iv, tag, encrypted] = value.split('.')
  if (version !== 'v1' || !iv || !tag || !encrypted) throw new Error('Invalid encrypted MFA secret.')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8')
}

function recoveryHash(code: string) {
  return createHmac('sha256', encryptionKey())
    .update(code.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .digest('hex')
}

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => randomBytes(5).toString('hex').toUpperCase().replace(/(.{5})/, '$1-'))
}

export function hashRecoveryCodes(codes: string[]) {
  return codes.map(recoveryHash)
}

/** Returns the remaining hash list with the matched code removed, or null if no match. */
export function consumeRecoveryCode(hashes: string[], code: string) {
  const candidate = recoveryHash(code)
  const index = hashes.findIndex((hash) => hash.length === candidate.length && timingSafeEqual(Buffer.from(hash), Buffer.from(candidate)))
  return index < 0 ? null : hashes.filter((_, current) => current !== index)
}

export function totpUri(secret: string, email: string) {
  return `otpauth://totp/${encodeURIComponent(`STOR24 CMS:${email}`)}?secret=${secret}&issuer=${encodeURIComponent('STOR24 CMS')}&algorithm=SHA1&digits=6&period=30`
}

export type MfaUserRecord = {
  mfaEnabled?: boolean | null
  mfaSecretEncrypted?: string | null
  mfaRecoveryCodeHashes?: string[] | null
}

export type MfaLoginContext = {
  totp?: string
  recoveryCode?: string
}

export type MfaLoginResult =
  | { ok: true; usedRecoveryCode: false }
  | { ok: true; usedRecoveryCode: true; remainingRecoveryCodeHashes: string[] }
  | { ok: false; reason: string }

/**
 * Pure decision function used by the `users` collection's `beforeLogin` hook.
 * Kept dependency-free (no Payload types) so it is directly unit-testable
 * without a database or a running Payload instance.
 */
export function evaluateMfaLogin(user: MfaUserRecord, context: MfaLoginContext): MfaLoginResult {
  if (!user.mfaEnabled) return { ok: true, usedRecoveryCode: false }
  if (!user.mfaSecretEncrypted) return { ok: false, reason: 'Two-step verification is misconfigured for this account. Contact an administrator.' }

  const totp = typeof context.totp === 'string' ? context.totp.trim() : ''
  const recoveryCode = typeof context.recoveryCode === 'string' ? context.recoveryCode.trim() : ''
  if (!totp && !recoveryCode) return { ok: false, reason: 'A verification code is required.' }

  if (totp) {
    let secret: string
    try {
      secret = decryptMfaSecret(user.mfaSecretEncrypted)
    } catch {
      return { ok: false, reason: 'Two-step verification is misconfigured for this account. Contact an administrator.' }
    }
    if (verifyTotp(secret, totp)) return { ok: true, usedRecoveryCode: false }
  }

  if (recoveryCode) {
    const hashes = Array.isArray(user.mfaRecoveryCodeHashes) ? user.mfaRecoveryCodeHashes.filter((value): value is string => typeof value === 'string') : []
    const remaining = consumeRecoveryCode(hashes, recoveryCode)
    if (remaining) return { ok: true, usedRecoveryCode: true, remainingRecoveryCodeHashes: remaining }
  }

  return { ok: false, reason: 'The verification code is incorrect.' }
}
