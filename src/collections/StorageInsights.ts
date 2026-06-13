import type { CollectionConfig } from 'payload'

export const StorageInsights: CollectionConfig = {
  slug: 'storage-insights',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pageType', 'primaryKeyword', 'status', 'publishedDate'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    // ---------- Core ----------
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page Title (H1)',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'e.g. self-storage-johannesburg-guide',
      },
    },
    {
      name: 'pageType',
      type: 'select',
      required: true,
      defaultValue: 'pillar',
      options: [
        { label: 'Pillar Guide', value: 'pillar' },
        { label: 'Cluster Page', value: 'cluster' },
      ],
      admin: {
        description: 'Pillar Guides are the 8 main long-form guides. Cluster Pages are supporting articles.',
      },
    },
    {
      name: 'relatedPillar',
      type: 'relationship',
      relationTo: 'storage-insights',
      filterOptions: {
        pageType: { equals: 'pillar' },
      },
      admin: {
        description: 'For Cluster Pages: which Pillar Guide this supports.',
        condition: (data) => data?.pageType === 'cluster',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },

    // ---------- SEO ----------
    {
      type: 'collapsible',
      label: 'SEO',
      fields: [
        {
          name: 'seoTitle',
          type: 'text',
          required: true,
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          required: true,
          maxLength: 155,
        },
        {
          name: 'primaryKeyword',
          type: 'text',
          required: true,
        },
        {
          name: 'secondaryKeywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
            },
          ],
        },
        {
          name: 'searchIntent',
          type: 'select',
          options: [
            { label: 'Informational', value: 'informational' },
            { label: 'Commercial', value: 'commercial' },
            { label: 'Transactional', value: 'transactional' },
            { label: 'Mixed', value: 'mixed' },
          ],
        },
      ],
    },

    // ---------- Hub card content ----------
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short summary shown on the Storage Insights hub card (1-2 sentences).',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },

    // ---------- Body ----------
    {
      name: 'content',
      type: 'richText',
      required: true,
    },

    // ---------- FAQs ----------
    {
      name: 'faqs',
      type: 'array',
      label: 'FAQs',
      minRows: 0,
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
        },
      ],
    },

    // ---------- CTA ----------
    {
      type: 'collapsible',
      label: 'Call to Action',
      fields: [
        {
          name: 'ctaHeading',
          type: 'text',
        },
        {
          name: 'ctaText',
          type: 'textarea',
        },
        {
          name: 'ctaButtonLabel',
          type: 'text',
          defaultValue: 'Get a Storage Quote',
        },
        {
          name: 'ctaButtonLink',
          type: 'text',
          defaultValue: '/quote',
        },
      ],
    },

    // ---------- Internal links (reference / QA only) ----------
    {
      name: 'internalLinks',
      type: 'array',
      label: 'Recommended Internal Links (reference)',
      admin: {
        description: 'For editorial/QA reference - documents which pages this content should link to.',
      },
      fields: [
        {
          name: 'targetPage',
          type: 'text',
          admin: { description: 'Page name or path, e.g. /storage-prices-johannesburg' },
        },
        {
          name: 'anchorText',
          type: 'text',
        },
      ],
    },

    // ---------- Schema ----------
    {
      name: 'schemaTypes',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Article', value: 'Article' },
        { label: 'FAQPage', value: 'FAQPage' },
        { label: 'BreadcrumbList', value: 'BreadcrumbList' },
        { label: 'LocalBusiness', value: 'LocalBusiness' },
        { label: 'Service', value: 'Service' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Which JSON-LD schema blocks to render for this page.',
      },
    },
  ],
}
