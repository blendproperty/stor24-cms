import type { GlobalConfig } from 'payload'
import { APIError } from 'payload'

export function validateMicroContent(value: unknown): true | string {
 if (value == null) return true
 if (typeof value !== 'object' || Array.isArray(value)) return 'Use a JSON object containing optional faqs and facilities.'
 const { faqs, facilities } = value as Record<string, unknown>
 if (faqs != null && (!Array.isArray(faqs) || faqs.some(f => typeof f?.question !== 'string' || !f.question.trim() || typeof f.answer !== 'string' || !f.answer.trim()))) return 'FAQs must be an array of non-empty question and answer text.'
 if (facilities != null && (typeof facilities !== 'object' || Array.isArray(facilities) || Object.values(facilities).some(v => typeof v !== 'string'))) return 'Facility introductions must be an object of facility slugs and text.'
 return true
}
export const MicroWarehousing: GlobalConfig = {
 slug: 'micro-warehousing',
 forceSelect: { published: true },
 hooks: { afterRead: [({ doc, req }) => { if (!req.user && !doc.published) throw new APIError('Content is not published.', 404); return doc }] }, label: 'Micro Warehousing',
 admin: { group: 'Website content', description: 'Business landing page and imagery. Availability and prices always come from the CRM.' },
 access: { read: () => true, update: ({ req }) => Boolean(req.user) },
 fields: [
  { name: 'published', type: 'checkbox', defaultValue: false },
  { name: 'headline', type: 'text', defaultValue: 'Your business grows.' },
  { name: 'accent', type: 'text', defaultValue: "We've got room." },
  { name: 'intro', type: 'textarea', defaultValue: 'Space for stock, equipment and your next stage of growth.' },
  { name: 'heroImage', type: 'upload', relationTo: 'media' },
  { name: 'distributionHeroImage', label: 'Header: Warehouse & distribution (200–500 m²)', type: 'upload', relationTo: 'media', admin: { description: 'Additional header slideshow example. Upload or replace its image here.' } },
  { name: 'bulkHeroImage', label: 'Header: Large-scale business storage (500–1,000 m²)', type: 'upload', relationTo: 'media', admin: { description: 'Additional header slideshow example. Upload or replace its image here.' } },
  { name: 'compactImage', type: 'upload', relationTo: 'media' },
  { name: 'growingImage', type: 'upload', relationTo: 'media' },
  { name: 'largeImage', type: 'upload', relationTo: 'media' },
  { name: 'warehouseImage', label: 'Larger business spaces (200–1,000 m²)', type: 'upload', relationTo: 'media', admin: { description: 'Fourth space option. Leave empty until the approved image is ready.' } },
  { name: 'detailsImage', type: 'upload', relationTo: 'media' },
  { name: 'seoTitle', type: 'text', defaultValue: 'Micro Warehousing | STOR24' },
  { name: 'seoDescription', type: 'textarea', defaultValue: 'Find ground-floor business storage for stock, tools and equipment at STOR24. Explore spaces, arrange a viewing or speak to our team.' },
  { name: 'content', type: 'json', validate: validateMicroContent, admin: { description: 'Optional approved FAQs and facility introductions. Do not enter inventory or prices.' } },
 ],
}
