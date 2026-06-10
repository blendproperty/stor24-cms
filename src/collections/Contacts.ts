import { CollectionConfig } from 'payload'

const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'status', 'score', 'createdAt'],
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text' },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'source',
      type: 'select',
      options: ['web_form', 'whatsapp', 'email', 'walk_in', 'referral'],
      defaultValue: 'web_form',
    },
    {
      name: 'unitSize',
      type: 'select',
      options: ['small', 'medium', 'large', 'extra_large'],
    },
    { name: 'moveInDate', type: 'date' },
    { name: 'score', type: 'number', min: 0, max: 100 },
    {
      name: 'status',
      type: 'select',
      options: ['new', 'quoted', 'viewing', 'converted', 'lost'],
      defaultValue: 'new',
    },
    { name: 'notes', type: 'textarea' },
  ],
  timestamps: true,
}

export default Contacts
