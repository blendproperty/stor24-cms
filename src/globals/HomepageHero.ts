import type { GlobalConfig } from 'payload'

export const HomepageHero: GlobalConfig = {
  slug: 'homepage-hero',
  label: 'Homepage Hero',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero copy',
      admin: { initCollapsed: false },
      fields: [
        { name: 'eyebrow', type: 'text', required: true, defaultValue: 'Storage for Johannesburg' },
        { name: 'headlinePrimary', label: 'Headline — ink line', type: 'text', required: true, defaultValue: 'Life happens.' },
        { name: 'headlineAccentLineOne', label: 'Headline — orange line 1', type: 'text', required: true, defaultValue: 'We’ve got' },
        { name: 'headlineAccentLineTwo', label: 'Headline — orange line 2', type: 'text', required: true, defaultValue: 'room.' },
        {
          name: 'bodyCopy',
          type: 'textarea',
          required: true,
          defaultValue: 'Moving, growing, renovating or simply running out of cupboards? Tell us what’s taking up space. We’ll help sort the rest.',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Hero images',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'slides',
          type: 'array',
          maxRows: 3,
          labels: { singular: 'Hero image', plural: 'Hero images' },
          fields: [
            { name: 'desktopImage', type: 'upload', relationTo: 'media', required: true },
            { name: 'mobileImage', type: 'upload', relationTo: 'media', admin: { description: 'Optional phone crop. Desktop image is used when empty.' } },
            { name: 'alt', type: 'text', required: true },
            {
              name: 'fit',
              type: 'select',
              required: true,
              defaultValue: 'contain',
              options: [
                { label: 'Contain — show the complete image', value: 'contain' },
                { label: 'Cover — fill and crop', value: 'cover' },
              ],
            },
            {
              name: 'position',
              type: 'select',
              required: true,
              defaultValue: 'center',
              options: ['left', 'center', 'right'],
            },
          ],
        },
        { name: 'rotationEnabled', label: 'Slowly rotate through images', type: 'checkbox', defaultValue: false },
        {
          name: 'rotationIntervalSeconds',
          label: 'Seconds per image',
          type: 'number',
          min: 6,
          max: 20,
          defaultValue: 9,
          admin: { condition: (_, siblingData) => Boolean(siblingData?.rotationEnabled) },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Size-guide call to action',
      fields: [
        { name: 'ctaEyebrow', type: 'text', required: true, defaultValue: 'No idea what size you need?' },
        { name: 'ctaStrong', type: 'text', required: true, defaultValue: 'Good. That’s what we’re here for.' },
        { name: 'ctaButtonLabel', type: 'text', required: true, defaultValue: 'Find my space' },
        { name: 'ctaButtonLink', type: 'text', required: true, defaultValue: '#quote' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Mobile benefit cards',
      fields: [
        { name: 'benefitsHeading', type: 'text', required: true, defaultValue: 'Why choose Stor24?' },
        {
          name: 'benefits',
          type: 'array',
          maxRows: 4,
          fields: [
            {
              name: 'icon',
              type: 'select',
              required: true,
              options: [
                { label: 'Controlled access', value: 'access' },
                { label: 'CCTV camera', value: 'camera' },
                { label: 'Flexible terms', value: 'flex' },
                { label: 'Helpful people', value: 'people' },
              ],
            },
            { name: 'title', type: 'text', required: true },
            { name: 'copy', type: 'text', required: true },
          ],
          defaultValue: [
            { icon: 'access', title: 'Controlled access', copy: 'Only authorised access' },
            { icon: 'camera', title: 'CCTV monitored', copy: 'Security taken seriously' },
            { icon: 'flex', title: 'Flexible terms', copy: 'Month-to-month freedom' },
            { icon: 'people', title: 'Helpful people', copy: 'Talk to a real person' },
          ],
        },
      ],
    },
  ],
}
