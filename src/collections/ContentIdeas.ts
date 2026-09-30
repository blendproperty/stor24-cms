import type { Access, CollectionConfig } from 'payload'

const editorsOnly: Access = ({ req: { user } }) => Boolean(user)

export const ContentIdeas: CollectionConfig = {
  slug: 'content-ideas',
  labels: { singular: 'Content idea', plural: 'Content ideas' },
  access: { read: editorsOnly, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  admin: {
    group: 'Planning',
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'format', 'keyword', 'priority', 'targetDate'],
    description: 'Make room for your next good idea. Plan useful content here before creating an article, guide or FAQ. Ideas stay private to your CMS team.',
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Content idea', admin: { description: 'A working title or a question your customers ask.' } },
    { type: 'row', fields: [
      { name: 'keyword', type: 'text', label: 'Target search phrase', admin: { width: '50%', description: 'The phrase a customer might type into Google. Check it in Search Console.' } },
      { name: 'audience', type: 'text', label: 'Who is it for?', admin: { width: '50%', description: 'For example, people moving home or businesses storing stock.' } },
    ] },
    { name: 'brief', type: 'textarea', label: 'The idea & writing brief', admin: { rows: 8, description: 'What will readers learn? Note the angle, useful answers and the next step you want them to take.' } },
    { name: 'research', type: 'textarea', label: 'Research & inspiration', admin: { rows: 5, description: 'Save customer questions, Search Console findings, source links and facts to check. Do not assume search volumes or rankings.' } },
    { name: 'publishedUrl', type: 'text', label: 'Finished content link', validate: (value: string | null | undefined) => !value || /^https:\/\/stor24\.co\.za\//.test(value) || 'Use a full https://stor24.co.za/ link.', admin: { description: 'Paste the STOR24 page link once the content is published. Changing an idea’s status does not publish a page.' } },
    { name: 'status', type: 'select', required: true, defaultValue: 'idea', options: [
      { label: 'New idea', value: 'idea' }, { label: 'Researching', value: 'researching' },
      { label: 'Ready to write', value: 'ready' }, { label: 'Writing', value: 'writing' },
      { label: 'Published', value: 'published' }, { label: 'Parked', value: 'parked' },
    ], admin: { position: 'sidebar' } },
    { name: 'format', type: 'select', required: true, defaultValue: 'guide', options: [
      { label: 'Storage guide', value: 'guide' }, { label: 'Article', value: 'article' },
      { label: 'FAQ', value: 'faq' }, { label: 'Location page', value: 'location' },
    ], admin: { position: 'sidebar' } },
    { name: 'priority', type: 'select', required: true, defaultValue: 'normal', options: [
      { label: 'High', value: 'high' }, { label: 'Normal', value: 'normal' }, { label: 'Low', value: 'low' },
    ], admin: { position: 'sidebar' } },
    { name: 'targetDate', type: 'date', label: 'Target publish date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } } },
  ],
}
