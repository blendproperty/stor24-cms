import { CollectionConfig } from 'payload'

const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'type',
    defaultColumns: ['contact', 'type', 'body', 'createdAt'],
  },
  fields: [
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: ['note', 'email', 'call', 'whatsapp', 'viewing', 'status_change'],
      required: true,
    },
    { name: 'body', type: 'textarea' },
  ],
  timestamps: true,
}

export default Activities
