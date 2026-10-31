import { APIError, type CollectionConfig } from 'payload'
import { authenticated, published } from '../access'
import { normalizeRedirectPath, redirectGraphIssue, redirectPathIssue, type RedirectRule } from '../lib/public-seo-rules'

export const Redirects: CollectionConfig = {
  slug: 'redirects', labels: { singular: 'Redirect', plural: 'Redirects' },
  admin: { group: 'Search & discovery', useAsTitle: 'source', defaultColumns: ['source', 'destination', 'statusCode', 'status', 'updatedAt'], description: 'Send an old public address to its replacement. Review the destination before publishing. Drafts do not redirect. Existing booking, payment and required legacy routes are protected. Incoming campaign queries are preserved.' },
  access: { read: published, create: authenticated, update: authenticated, delete: authenticated },
  hooks: { beforeChange: [async ({ data, originalDoc, req }) => {
    const next = { ...originalDoc, ...data }
    if (next.status !== 'published') return data
    const match = String(next.source).match(/^\/(blog|storage-insights)\/([^/]+)$/)
    if (match) {
      const current = await req.payload.find({ collection: match[1] === 'blog' ? 'posts' : 'storage-insights', where: { and: [{ slug: { equals: match[2] } }, { status: { equals: 'published' } }] }, limit: 1, depth: 0, overrideAccess: true, req })
      if (current.totalDocs) throw new APIError('Unpublish the old article or guide before redirecting its address.', 400)
    }
    const existing = await req.payload.find({ collection: 'redirects', where: { status: { equals: 'published' } }, limit: 1000, depth: 0, overrideAccess: true, req })
    if (existing.totalDocs > 1000) throw new APIError('Review the published redirect list before adding more rules.', 400)
    const rows = existing.docs.filter(row => String(row.id) !== String(originalDoc?.id)).map(row => ({ source: row.source, destination: row.destination, statusCode: row.statusCode }))
    const issue = redirectGraphIssue([...rows, next as RedirectRule])
    if (issue) throw new APIError(issue, 400)
    return data
  }] },
  fields: [
    { name: 'publishingReview', type: 'ui', admin: { components: { Field: '@/components/PublicSeoPreview#RedirectPreview' } } },
    ...(['source', 'destination'] as const).map(name => ({ name, label: name === 'source' ? 'Old page address' : 'Replacement page address', type: 'text' as const, required: true, ...(name === 'source' ? { unique: true } : {}), maxLength: 512, hooks: { beforeValidate: [({ value }: { value?: unknown }) => normalizeRedirectPath(value) || value] }, validate: (value: unknown) => redirectPathIssue(value, name) || true })),
    { name: 'statusCode', label: 'Redirect type', type: 'number', required: true, defaultValue: 308, validate: (value: unknown) => [301, 302, 307, 308].includes(Number(value)) || 'Choose a supported permanent or temporary move.', admin: { components: { Field: '@/components/PublicSeoPreview#RedirectTypeField' } } },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }], admin: { position: 'sidebar' } },
  ],
}
