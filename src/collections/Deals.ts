import { CollectionConfig } from 'payload'

const Deals: CollectionConfig = {
  slug: 'deals',
  admin: {
    useAsTitle: 'stage',
    defaultColumns: ['contact', 'stage', 'unitSize', 'monthlyRate', 'startDate', 'createdAt'],
  },
  fields: [
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts',
      required: true,
    },
    {
      name: 'stage',
      type: 'select',
      options: ['new_lead', 'quoted', 'viewing_scheduled', 'converted', 'active', 'churned', 'lost'],
      defaultValue: 'new_lead',
      required: true,
    },
    {
      name: 'unitSize',
      type: 'select',
      options: ['small', 'medium', 'large', 'extra_large'],
    },
    { name: 'monthlyRate', type: 'number' },
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
  ],
  timestamps: true,
}

export default Deals
