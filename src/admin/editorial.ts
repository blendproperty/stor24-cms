import type { CollectionConfig, Field } from 'payload'

const section = (label: string, description: string, fields: Field[]): Field => ({
  type: 'collapsible',
  label,
  admin: { initCollapsed: false, description },
  fields,
})

// Layout-only containers are unnamed: existing database and public API paths stay intact.
export function editorialCollection(collection: CollectionConfig): CollectionConfig {
  collection.admin = { ...collection.admin, hideAPIURL: true }
  const fields = collection.fields
  const named = (names: string[]) =>
    fields.filter((field) => 'name' in field && names.includes(field.name))
  const sidebar = (names: string[]): Field[] =>
    named(names).map(
      (field) => ({ ...field, admin: { ...field.admin, position: 'sidebar' } }) as Field,
    )
  if (collection.slug === 'posts')
    collection.fields = [
      section(
        'Article details',
        'Give this story a clear title and a useful introduction.',
        named(['title', 'slug', 'excerpt']),
      ),
      section(
        'Write your story',
        'Use short paragraphs and descriptive headings to make the article easy to scan.',
        named(['content']),
      ),
      section(
        'Photography & topics',
        'Choose the image and topics that help readers find this article.',
        named(['featuredImage', 'tags']),
      ),
      ...sidebar(['status', 'publishedAt']),
    ]
  if (collection.slug === 'areas')
    collection.fields = [
      section(
        'Location details',
        'Introduce the area and explain how STOR24 can help.',
        named(['name', 'slug', 'intro']),
      ),
      section(
        'Storage for your customers',
        'Write relevant, specific copy for people and businesses in this area.',
        named(['personalCopy', 'businessCopy']),
      ),
      section(
        'Nearby areas',
        'Help visitors recognise the neighbourhoods you serve.',
        named(['nearby']),
      ),
    ]
  if (collection.slug === 'storage-insights') {
    const assigned = new Set([
      'title',
      'slug',
      'pageType',
      'relatedPillar',
      'status',
      'publishedDate',
      'excerpt',
      'heroImage',
      'content',
      'faqs',
      'internalLinks',
      'schemaTypes',
    ])
    collection.fields = [
      section(
        'Guide details',
        'Start with the title, page address and a short summary for the website.',
        named(['title', 'slug', 'pageType', 'relatedPillar', 'excerpt', 'heroImage']),
      ),
      section(
        'Write your guide',
        'Make this a practical, useful resource for someone choosing storage.',
        named(['content']),
      ),
      section(
        'Questions & related reading',
        'Add relevant answers and record the links you want to include.',
        named(['faqs', 'internalLinks']),
      ),
      ...fields.filter((field) => !('name' in field) || !assigned.has(field.name)),
      ...sidebar(['status', 'publishedDate', 'schemaTypes']),
    ]
  }
  if (['posts', 'storage-insights'].includes(collection.slug)) {
    collection.fields.unshift({ name: 'seoReview', type: 'ui', admin: { components: { Field: { path: '@/components/SeoReview#SeoReview', clientProps: { guide: collection.slug === 'storage-insights' } } } } })
  }
  return collection
}
