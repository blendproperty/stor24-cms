import type { CollectionConfig } from 'payload'
import { generatePayloadCookie } from 'payload/shared'
import {
  decryptMfaSecret,
  encryptMfaSecret,
  evaluateMfaLogin,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCodes,
  totpUri,
  verifyTotp,
} from '@/lib/mfa'

const adminOnly = ({ req: { user } }: { req: { user: unknown } }) => Boolean(user)

async function readJson(req: { json?: () => Promise<unknown> }): Promise<Record<string, unknown>> {
  try {
    if (!req.json) return {}
    return ((await req.json()) as Record<string, unknown>) ?? {}
  } catch {
    return {}
  }
}

/**
 * CMS administrator MFA (CMS owns editorial content only; this collection
 * still needs its own second factor because CRM MFA does not protect this
 * admin surface — see PROJECT_CONTEXT.md "CMS administrator MFA").
 *
 * Enforcement point: the `beforeLogin` hook below runs for every login
 * through this collection — the default `/api/users/login` REST route, the
 * local API, and GraphQL — regardless of which endpoint a client calls, so
 * once `mfaEnabled` is true on an account there is no route that can
 * complete a login for it without a correct `context.totp` or
 * `context.recoveryCode`. The default REST/GraphQL login routes never
 * supply that context, so an MFA-enabled account can only complete login
 * through the `/api/users/custom-login` endpoint added below.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 7200,
    useAPIKey: true,
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'mfaEnabled'],
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'mfaManagement',
      type: 'ui',
      admin: {
        components: { Field: '@/components/MfaManagementField#MfaManagementField' },
      },
    },
    {
      name: 'mfaEnabled',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Managed from the account security panel, not edited directly.',
      },
    },
    {
      name: 'mfaSecretEncrypted',
      type: 'text',
      admin: { hidden: true },
      access: { read: () => false },
    },
    {
      name: 'mfaRecoveryCodeHashes',
      type: 'json',
      admin: { hidden: true },
      access: { read: () => false },
    },
  ],
  hooks: {
    beforeLogin: [
      ({ user, context }) => {
        const result = evaluateMfaLogin(
          {
            mfaEnabled: (user as { mfaEnabled?: boolean }).mfaEnabled,
            mfaSecretEncrypted: (user as { mfaSecretEncrypted?: string }).mfaSecretEncrypted,
            mfaRecoveryCodeHashes: (user as { mfaRecoveryCodeHashes?: string[] }).mfaRecoveryCodeHashes,
          },
          {
            totp: typeof context?.totp === 'string' ? context.totp : undefined,
            recoveryCode: typeof context?.recoveryCode === 'string' ? context.recoveryCode : undefined,
          },
        )
        if (!result.ok) throw new Error(result.reason)
        // Consuming a recovery code mutates state; stash it on the request
        // context so the custom-login endpoint (which has the payload
        // instance and transaction handling) can persist the removal after
        // login succeeds. beforeLogin hooks cannot themselves await a
        // write against the same user row mid-login without risking a
        // deadlock with the login operation's own read.
        if (result.ok && result.usedRecoveryCode) {
          ;(context as Record<string, unknown>).consumedRecoveryCodeHashes = result.remainingRecoveryCodeHashes
        }
        return user
      },
    ],
  },
  endpoints: [
    {
      path: '/mfa',
      method: 'get',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'Sign in required.' }, { status: 401 })
        const record = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
          select: { mfaEnabled: true, mfaRecoveryCodeHashes: true },
          overrideAccess: true,
        })
        const hashes = Array.isArray(record?.mfaRecoveryCodeHashes) ? record.mfaRecoveryCodeHashes.filter((value): value is string => typeof value === 'string') : []
        return Response.json({ enabled: Boolean(record?.mfaEnabled), recoveryCodesRemaining: hashes.length })
      },
    },
    {
      path: '/mfa/begin',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'Sign in required.' }, { status: 401 })
        const existing = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
          select: { mfaEnabled: true },
          overrideAccess: true,
        })
        if (existing?.mfaEnabled) {
          return Response.json({ error: 'Turn off the current authenticator before replacing it.' }, { status: 409 })
        }
        const secret = generateTotpSecret()
        await req.payload.update({
          collection: 'users',
          id: req.user.id,
          data: { mfaSecretEncrypted: encryptMfaSecret(secret), mfaRecoveryCodeHashes: [] },
          overrideAccess: true,
        })
        return Response.json({ secret, uri: totpUri(secret, String(req.user.email ?? '')) })
      },
    },
    {
      path: '/mfa/enable',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'Sign in required.' }, { status: 401 })
        const body = await readJson(req)
        const code = typeof body.code === 'string' ? body.code.trim() : ''
        const record = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
          select: { mfaEnabled: true, mfaSecretEncrypted: true },
          overrideAccess: true,
        })
        if (record?.mfaEnabled) return Response.json({ error: 'Two-step verification is already enabled.' }, { status: 409 })
        if (!record?.mfaSecretEncrypted) return Response.json({ error: 'Start authenticator setup first.' }, { status: 409 })
        if (!verifyTotp(decryptMfaSecret(record.mfaSecretEncrypted), code)) {
          return Response.json({ error: 'The authenticator code is incorrect.' }, { status: 422 })
        }
        const recoveryCodes = generateRecoveryCodes()
        await req.payload.update({
          collection: 'users',
          id: req.user.id,
          data: { mfaEnabled: true, mfaRecoveryCodeHashes: hashRecoveryCodes(recoveryCodes) },
          overrideAccess: true,
        })
        return Response.json({ enabled: true, recoveryCodes })
      },
    },
    {
      path: '/mfa/regenerate',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'Sign in required.' }, { status: 401 })
        const body = await readJson(req)
        const code = typeof body.code === 'string' ? body.code.trim() : ''
        const record = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
          select: { mfaEnabled: true, mfaSecretEncrypted: true, mfaRecoveryCodeHashes: true },
          overrideAccess: true,
        })
        const hashes = Array.isArray(record?.mfaRecoveryCodeHashes) ? record.mfaRecoveryCodeHashes.filter((value): value is string => typeof value === 'string') : []
        const result = evaluateMfaLogin(
          { mfaEnabled: record?.mfaEnabled, mfaSecretEncrypted: record?.mfaSecretEncrypted, mfaRecoveryCodeHashes: hashes },
          { totp: code, recoveryCode: code },
        )
        if (!record?.mfaEnabled || !result.ok) {
          return Response.json({ error: 'A current authenticator or recovery code is required.' }, { status: 422 })
        }
        const recoveryCodes = generateRecoveryCodes()
        await req.payload.update({
          collection: 'users',
          id: req.user.id,
          data: { mfaRecoveryCodeHashes: hashRecoveryCodes(recoveryCodes) },
          overrideAccess: true,
        })
        return Response.json({ recoveryCodes })
      },
    },
    {
      path: '/mfa/disable',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'Sign in required.' }, { status: 401 })
        const body = await readJson(req)
        const code = typeof body.code === 'string' ? body.code.trim() : ''
        const password = typeof body.password === 'string' ? body.password : ''
        if (!password) return Response.json({ error: 'Your password and a current verification code are required.' }, { status: 422 })
        const record = await req.payload.findByID({
          collection: 'users',
          id: req.user.id,
          select: { mfaEnabled: true, mfaSecretEncrypted: true, mfaRecoveryCodeHashes: true, email: true },
          overrideAccess: true,
        })
        const hashes = Array.isArray(record?.mfaRecoveryCodeHashes) ? record.mfaRecoveryCodeHashes.filter((value): value is string => typeof value === 'string') : []
        const codeResult = evaluateMfaLogin(
          { mfaEnabled: record?.mfaEnabled, mfaSecretEncrypted: record?.mfaSecretEncrypted, mfaRecoveryCodeHashes: hashes },
          { totp: code, recoveryCode: code },
        )
        if (!record?.mfaEnabled || !codeResult.ok) {
          return Response.json({ error: 'Your password and a current verification code are required.' }, { status: 422 })
        }
        try {
          // Reuses Payload's own password verification instead of touching
          // its internal password-hash storage directly.
          await req.payload.login({ collection: 'users', data: { email: String(record.email), password } })
        } catch {
          return Response.json({ error: 'Your password and a current verification code are required.' }, { status: 422 })
        }
        await req.payload.update({
          collection: 'users',
          id: req.user.id,
          data: { mfaEnabled: false, mfaSecretEncrypted: null, mfaRecoveryCodeHashes: [] },
          overrideAccess: true,
        })
        return Response.json({ disabled: true })
      },
    },
    {
      path: '/custom-login',
      method: 'post',
      handler: async (req) => {
        const body = await readJson(req)
        const email = typeof body.email === 'string' ? body.email : ''
        const password = typeof body.password === 'string' ? body.password : ''
        const totp = typeof body.code === 'string' ? body.code.trim() : undefined
        const recoveryCode = typeof body.recoveryCode === 'string' ? body.recoveryCode.trim() : undefined
        if (!email || !password) return Response.json({ error: 'Email and password are required.' }, { status: 400 })

        const context: Record<string, unknown> = { totp, recoveryCode }
        let result
        try {
          result = await req.payload.login({
            collection: 'users',
            data: { email, password },
            context,
            req,
          })
        } catch (error) {
          return Response.json({ error: error instanceof Error ? error.message : 'Invalid email, password or verification code.' }, { status: 401 })
        }

        if (context.consumedRecoveryCodeHashes) {
          await req.payload.update({
            collection: 'users',
            id: result.user.id,
            data: { mfaRecoveryCodeHashes: context.consumedRecoveryCodeHashes },
            overrideAccess: true,
          })
        }

        const cookie = generatePayloadCookie({
          collectionAuthConfig: req.payload.collections.users.config.auth,
          cookiePrefix: req.payload.config.cookiePrefix,
          token: result.token as string,
        })
        return Response.json(
          { user: { id: result.user.id, email: result.user.email } },
          { headers: { 'Set-Cookie': cookie as string } },
        )
      },
    },
  ],
}
