import type { CheckboxField } from 'payload'

export const searchIndexing: CheckboxField = {
  name: 'noIndex',
  type: 'checkbox',
  label: 'Exclude from search results',
  defaultValue: false,
  admin: {
    position: 'sidebar',
    description: 'Published content stays available by its link, but is excluded from the sitemap and asks search engines not to index it. This is not privacy protection. Canonical addresses are generated from the published page address.',
  },
}
