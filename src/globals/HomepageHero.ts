import { ValidationError, type GlobalConfig } from 'payload'

type MediaReference = number | string | { id: number | string; width?: number | null; height?: number | null; mimeType?: string | null }

const mediaID = (value: MediaReference) => (typeof value === 'object' ? value.id : value)
const validateInternalLink = (value: string | null | undefined) => {
  if (!value || value.length > 120 || (!value.startsWith('/') && !value.startsWith('#')) || value.startsWith('//')) {
    return 'Use a safe internal path beginning with / or an on-page anchor beginning with #.'
  }
  return true
}

const validateHeroImage = async (
  value: MediaReference | null | undefined,
  req: Parameters<NonNullable<NonNullable<GlobalConfig['hooks']>['beforeValidate']>[number]>[0]['req'],
  path: string,
  mobile = false,
) => {
  if (!value) return []
  const media = typeof value === 'object'
    ? value
    : await req.payload.findByID({ collection: 'media', id: mediaID(value), depth: 0, req })
  const width = Number(media.width || 0)
  const height = Number(media.height || 0)
  const mimeType = String(media.mimeType || '')
  const errors: Array<{ path: string; message: string }> = []

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    errors.push({ path, message: 'Use a JPG, PNG or WebP image.' })
  }
  if (mobile) {
    if (width < 720 || height < 900 || width > height) {
      errors.push({ path, message: 'Mobile hero images must be portrait and at least 720 × 900px.' })
    }
  } else {
    const ratio = height ? width / height : 0
    if (width < 1200 || height < 800 || ratio < 1.2 || ratio > 1.6) {
      errors.push({ path, message: 'Desktop hero images must be at least 1200 × 800px with an aspect ratio between 6:5 and 8:5.' })
    }
  }
  return errors
}

export const HomepageHero: GlobalConfig = {
  slug: 'homepage-hero',
  label: 'Homepage Hero',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [async ({ data, req }) => {
      const slides = Array.isArray(data?.slides) ? data.slides : []
      if (data && slides.length < 2) data.rotationEnabled = false
      const errors = (await Promise.all(slides.flatMap((slide: { desktopImage?: MediaReference; mobileImage?: MediaReference | null }, index: number) => [
        validateHeroImage(slide?.desktopImage as MediaReference, req, `slides.${index}.desktopImage`),
        validateHeroImage(slide?.mobileImage as MediaReference | null, req, `slides.${index}.mobileImage`, true),
      ]))).flat()
      if (errors.length) throw new ValidationError({ global: 'homepage-hero', errors })
      return data
    }],
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero copy',
      admin: { initCollapsed: false },
      fields: [
        { name: 'eyebrow', type: 'text', required: true, maxLength: 40, defaultValue: 'Storage for Johannesburg' },
        { name: 'headlinePrimary', label: 'Headline — ink line', type: 'text', required: true, maxLength: 28, defaultValue: 'Life happens.' },
        { name: 'headlineAccentLineOne', label: 'Headline — orange line 1', type: 'text', required: true, maxLength: 24, defaultValue: 'We’ve got' },
        { name: 'headlineAccentLineTwo', label: 'Headline — orange line 2', type: 'text', required: true, maxLength: 20, defaultValue: 'room.' },
        {
          name: 'bodyCopy',
          type: 'textarea',
          required: true,
          maxLength: 180,
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
          minRows: 1,
          maxRows: 3,
          labels: { singular: 'Hero image', plural: 'Hero images' },
          fields: [
            { name: 'desktopImage', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Landscape JPG, PNG or WebP. Minimum 1200 × 800px; accepted ratio 6:5 to 8:5.' } },
            { name: 'mobileImage', type: 'upload', relationTo: 'media', admin: { description: 'Optional portrait crop, minimum 720 × 900px. Desktop image is used when empty.' } },
            { name: 'alt', type: 'text', required: true, maxLength: 120 },
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
        { name: 'ctaEyebrow', type: 'text', required: true, maxLength: 45, defaultValue: 'No idea what size you need?' },
        { name: 'ctaStrong', type: 'text', required: true, maxLength: 55, defaultValue: 'Good. That’s what we’re here for.' },
        { name: 'ctaButtonLabel', type: 'text', required: true, maxLength: 24, defaultValue: 'Find my space' },
        { name: 'ctaButtonLink', type: 'text', required: true, maxLength: 120, validate: validateInternalLink, defaultValue: '#quote' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Mobile benefit cards',
      fields: [
        { name: 'benefitsHeading', type: 'text', required: true, maxLength: 40, defaultValue: 'Why choose Stor24?' },
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
            { name: 'title', type: 'text', required: true, maxLength: 28 },
            { name: 'copy', type: 'text', required: true, maxLength: 45 },
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
