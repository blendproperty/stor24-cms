import type { EmailAdapter } from 'payload'

const senderAddress = () => {
  const configured = process.env.EMAIL_FROM || 'noreply@stor24.co.za'
  const address = (configured.match(/<([^<>]+)>/)?.[1] || configured).trim()
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address)) throw new Error('CMS sender address is invalid.')
  return address
}

/** Transactional CMS account recovery, using the approved company sender. */
export const cmsEmail: EmailAdapter = () => ({
  name: 'stor24-sendgrid',
  defaultFromAddress: senderAddress(),
  defaultFromName: 'STOR24 Content Studio',
  async sendEmail(message) {
    const key = process.env.SENDGRID_API_KEY
    if (!key) throw new Error('CMS recovery email is not configured.')
    const values = Array.isArray(message.to) ? message.to : [message.to]
    const to = values.flatMap((value: unknown) => {
      if (typeof value === 'string') return [{ email: value }]
      if (value && typeof value === 'object' && 'address' in value) return [{ email: String(value.address) }]
      return []
    })
    if (!to.length) throw new Error('A recovery recipient is required.')
    const content = [
      ...(typeof message.text === 'string' ? [{ type: 'text/plain', value: message.text }] : []),
      ...(typeof message.html === 'string' ? [{ type: 'text/html', value: message.html }] : []),
    ]
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ personalizations: [{ to }], from: { email: senderAddress(), name: 'STOR24 Content Studio' }, subject: message.subject, content }),
    })
    if (!response.ok) throw new Error(`Recovery email provider returned ${response.status}.`)
    return { accepted: true }
  },
})
