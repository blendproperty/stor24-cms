import type { GlobalConfig } from 'payload'
export const MicroWarehousing: GlobalConfig = {
 slug: 'micro-warehousing', label: 'Micro Warehousing',
 admin: { group: 'Website content', description: 'Business landing page and imagery. Availability and prices always come from the CRM.' },
 access: { read: () => true, update: ({ req }) => Boolean(req.user) },
 fields: [
  { name: 'published', type: 'checkbox', defaultValue: false },
  { name: 'headline', type: 'text', defaultValue: 'Your business grows.' },
  { name: 'accent', type: 'text', defaultValue: 'Weâ€™ve got room.' },
  { name: 'intro', type: 'textarea', defaultValue: 'Space for stock, equipment and your next stage of growth.' },
  { name: 'heroImage', type: 'upload', relationTo: 'media' },
  { name: 'compactImage', type: 'upload', relationTo: 'media' },
  { name: 'growingImage', type: 'upload', relationTo: 'media' },
  { name: 'largeImage', type: 'upload', relationTo: 'media' },
  { name: 'detailsImage', type: 'upload', relationTo: 'media' },
  { name: 'seoTitle', type: 'text', defaultValue: 'Micro Warehousing | STOR24' },
  { name: 'seoDescription', type: 'textarea', defaultValue: 'Find ground-floor business storage for stock, tools and equipment at STOR24. Explore spaces, arrange a viewing or speak to our team.' },
  { name: 'content', type: 'json', admin: { description: 'Optional approved FAQs and facility introductions. Do not enter inventory or prices.' } },
 ],
}
