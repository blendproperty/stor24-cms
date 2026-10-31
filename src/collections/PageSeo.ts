import { APIError, type CollectionConfig } from 'payload'
import { authenticated, published } from '../access'
import { searchIndexing } from '../fields/search-indexing'
import { MANAGED_PAGE_PATHS, pageSeoIssue, type PageSeoRule } from '../lib/public-seo-rules'

const pages = MANAGED_PAGE_PATHS.map(value => ({ label: `https://stor24.co.za${value}`, value }))
export const PageSeo: CollectionConfig = {
  slug: 'page-seo', labels: { singular: 'Page SEO', plural: 'Page SEO' },
  admin: { group: 'Search & discovery', useAsTitle: 'path', defaultColumns: ['path', 'status', 'seoTitle', 'noIndex', 'updatedAt'], description: 'Manage search and social previews for existing public pages. Drafts do not affect the website. Blank fields retain the current website defaults. Published changes can take up to one minute.' },
  access: { read: published, create: authenticated, update: authenticated, delete: authenticated },
  hooks: { beforeChange: [async ({ data, originalDoc, req }) => {
    const next = { ...originalDoc, ...data }
    if (next.status !== 'published') return data
    const existing = await req.payload.find({ collection: 'page-seo', where: { status: { equals: 'published' } }, limit: 100, depth: 0, overrideAccess: true, req })
    const rows = existing.docs.filter(row => String(row.id) !== String(originalDoc?.id)).map(row => ({ path: row.path, canonicalPath: row.canonicalPath, noIndex: row.noIndex }))
    const issue = pageSeoIssue([...rows, next as PageSeoRule])
    if (issue) throw new APIError(issue, 400)
    return data
  }] },
  fields: [
    { name: 'publishingReview', type: 'ui', admin: { components: { Field: '@/components/PublicSeoPreview#PageSeoPreview' } } },
    { name: 'path', label: 'Website page', type: 'select', required: true, unique: true, options: pages, admin: { description: 'These are existing, verified public routes. This does not create or change a page address.' } },
    { name: 'seoTitle', label: 'Search title', type: 'text', maxLength: 150 },
    { name: 'metaDescription', label: 'Search description', type: 'textarea', maxLength: 320 },
    { name: 'canonicalPath', label: 'Canonical page', type: 'select', options: pages, admin: { description: 'Leave empty to use this page. Choose another page only for equivalent content. Excluded targets and canonical chains cannot be published.' } },
    { ...searchIndexing, admin: { ...searchIndexing.admin, description: 'The published page stays public by its link, but is removed from the sitemap and asks search engines not to index it. This is not privacy protection. Clear an alternate canonical choice before selecting exclusion.' } },
    { name: 'ogTitle', label: 'Social preview title', type: 'text', maxLength: 150, admin: { description: 'Optional; otherwise uses the search title.' } },
    { name: 'ogDescription', label: 'Social preview description', type: 'textarea', maxLength: 320, admin: { description: 'Optional; otherwise uses the search description.' } },
    { name: 'socialImage', label: 'Social preview image', type: 'upload', relationTo: 'media', admin: { description: 'Optional; choose approved artwork from the media library.' } },
    { name: 'status', type: 'select', required: true, defaultValue: 'draft', options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }], admin: { position: 'sidebar', description: 'Review before publishing. Unpublish or remove the record to restore website defaults.' } },
  ],
}
