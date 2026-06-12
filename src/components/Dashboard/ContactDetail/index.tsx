'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type Contact = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  source: string
  unitSize?: string
  moveInDate?: string
  score?: number
  status: string
  notes?: string
  createdAt: string
}

type Deal = {
  id: string
  stage: string
  unitSize?: string
  monthlyRate?: number
  startDate?: string
  endDate?: string
}

type Activity = {
  id: string
  type: string
  body?: string
  createdAt: string
}

const statusColor: Record<string, { bg: string; text: string }> = {
  new: { bg: '#E1F5EE', text: '#085041' },
  quoted: { bg: '#E6F1FB', text: '#0C447C' },
  viewing: { bg: '#FAEEDA', text: '#633806' },
  converted: { bg: '#EAF3DE', text: '#27500A' },
  lost: { bg: '#FCEBEB', text: '#791F1F' },
}

const sourceLabel: Record<string, string> = {
  web_form: 'Web form',
  whatsapp: 'WhatsApp',
  email: 'Email',
  walk_in: 'Walk in',
  referral: 'Referral',
}

const stageMeta: Record<string, { label: string; bg: string; text: string }> = {
  new_lead: { label: 'New lead', bg: '#FAEEDA', text: '#633806' },
  quoted: { label: 'Quoted', bg: '#E6F1FB', text: '#0C447C' },
  viewing_scheduled: { label: 'Viewing scheduled', bg: '#EEEDFE', text: '#3C3489' },
  active: { label: 'Active', bg: '#EAF3DE', text: '#27500A' },
  churned: { label: 'Churned', bg: '#FAECE7', text: '#712B13' },
  lost: { label: 'Lost', bg: '#FCEBEB', text: '#791F1F' },
}

const transitions: Record<string, { next: string; label: string; color: string }[]> = {
  new_lead: [
    { next: 'quoted', label: 'Mark as quoted', color: '#378ADD' },
    { next: 'lost', label: 'Mark as lost', color: '#E24B4A' },
  ],
  quoted: [
    { next: 'viewing_scheduled', label: 'Schedule viewing', color: '#7F77DD' },
    { next: 'active', label: 'Mark active', color: '#639922' },
    { next: 'lost', label: 'Mark as lost', color: '#E24B4A' },
  ],
  viewing_scheduled: [
    { next: 'active', label: 'Mark active', color: '#639922' },
    { next: 'lost', label: 'Mark as lost', color: '#E24B4A' },
  ],
  active: [
    { next: 'churned', label: 'Mark churned', color: '#D85A30' },
  ],
  churned: [],
  lost: [],
}

const activityTypeMeta: Record<string, { label: string; color: string }> = {
  note: { label: 'Note', color: '#534AB7' },
  email: { label: 'Email', color: '#378ADD' },
  call: { label: 'Call', color: '#1D9E75' },
  whatsapp: { label: 'WhatsApp', color: '#1D9E75' },
  viewing: { label: 'Viewing', color: '#EF9F27' },
  status_change: { label: 'Status change', color: '#9a9488' },
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  boxShadow: '0 1px 2px rgba(40,30,10,0.04), 0 4px 16px rgba(40,30,10,0.04)',
  border: '1px solid rgba(40,30,10,0.04)',
}

export const ContactDetail = () => {
  const searchParams = useSearchParams()
  const id = searchParams?.get('id') || ''

  const [contact, setContact] = useState<Contact | null>(null)
  const [deal, setDeal] = useState<Deal | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [updatingStage, setUpdatingStage] = useState(false)

  const load = async () => {
    const [contactRes, dealsRes, activitiesRes] = await Promise.all([
      fetch(`/api/contacts/${id}`),
      fetch(`/api/deals?where[contact][equals]=${id}&limit=1&sort=-updatedAt`),
      fetch(`/api/activities?where[contact][equals]=${id}&limit=50&sort=-createdAt`),
    ])
    const contactData = await contactRes.json()
    const dealsData = await dealsRes.json()
    const activitiesData = await activitiesRes.json()

    setContact(contactData)
    setDeal(dealsData.docs?.[0] || null)
    setActivities(activitiesData.docs || [])
    setLoading(false)
  }

  useEffect(() => {
    if (id) load()
  }, [id])

  const updateStage = async (newStage: string) => {
    if (!deal) return
    setUpdatingStage(true)
    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stage: newStage }),
      })
      await load()
    } finally {
      setUpdatingStage(false)
    }
  }

  const saveNote = async () => {
    if (!noteText.trim()) return
    setSaving(true)
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ contact: id, type: 'note', body: noteText.trim() }),
      })
      setNoteText('')
      await load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <p style={{ color: '#a89f8f', fontSize: '14px' }}>Loading…</p>
      </div>
    )
  }

  if (!contact) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <p style={{ color: '#E24B4A', fontSize: '14px' }}>Contact not found.</p>
      </div>
    )
  }

  const sc = statusColor[contact.status] || { bg: '#f1efe8', text: '#5f5e5a' }
  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '2.5rem 2rem 4rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Back link */}
      <Link href="/admin/crm-dashboard" style={{ fontSize: '13px', color: '#a89f8f', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to dashboard
      </Link>

      {/* Header card */}
      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.25rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: '#EEEDFE', color: '#534AB7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#2c2c2a' }}>
              {contact.firstName} {contact.lastName}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#a89f8f' }}>
              Added {new Date(contact.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span style={{
            background: sc.bg, color: sc.text,
            padding: '5px 14px', borderRadius: '20px',
            fontSize: '12.5px', fontWeight: 600, textTransform: 'capitalize',
          }}>
            {contact.status}
          </span>
          <Link href={`/admin/collections/contacts/${contact.id}`} style={{
            fontSize: '12.5px', color: '#534AB7', textDecoration: 'none', fontWeight: 600,
            border: '1px solid #534AB733', borderRadius: '8px', padding: '5px 12px',
          }}>
            Edit
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f5f2ec' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#a89f8f', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#534AB7', fontWeight: 500 }}>{contact.email}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#a89f8f', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#2c2c2a', fontWeight: 500 }}>{contact.phone || '—'}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#a89f8f', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Source</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#2c2c2a', fontWeight: 500 }}>{sourceLabel[contact.source] || contact.source}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#a89f8f', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unit size</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#2c2c2a', fontWeight: 500, textTransform: 'capitalize' }}>{contact.unitSize?.replace('_', ' ') || '—'}</p>
          </div>
        </div>

        {contact.notes && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f5f2ec' }}>
            <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#a89f8f', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Enquiry notes</p>
            <p style={{ margin: 0, fontSize: '14px', color: '#5f5e5a', lineHeight: 1.6 }}>{contact.notes}</p>
          </div>
        )}
      </div>

      {/* Deal card */}
      <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#2c2c2a' }}>Deal</h2>
          {deal && (
            <Link href={`/admin/collections/deals/${deal.id}`} style={{
              fontSize: '12.5px', color: '#534AB7', textDecoration: 'none', fontWeight: 600,
            }}>
              Edit deal
            </Link>
          )}
        </div>

        {!deal ? (
          <p style={{ color: '#a89f8f', fontSize: '14px' }}>No deal linked to this contact yet.</p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <span style={{
                background: stageMeta[deal.stage]?.bg || '#f1efe8',
                color: stageMeta[deal.stage]?.text || '#5f5e5a',
                padding: '5px 14px', borderRadius: '20px',
                fontSize: '12.5px', fontWeight: 600,
              }}>
                {stageMeta[deal.stage]?.label || deal.stage}
              </span>
              {deal.unitSize && (
                <span style={{ fontSize: '13px', color: '#9a9488', textTransform: 'capitalize' }}>
                  {deal.unitSize.replace('_', ' ')} unit
                </span>
              )}
              {deal.monthlyRate && (
                <span style={{ fontSize: '13px', color: '#9a9488' }}>
                  · R{deal.monthlyRate}/month
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', opacity: updatingStage ? 0.5 : 1 }}>
              {(transitions[deal.stage] || []).map((a) => (
                <button
                  key={a.next}
                  disabled={updatingStage}
                  onClick={() => updateStage(a.next)}
                  style={{
                    border: `1px solid ${a.color}33`,
                    background: `${a.color}14`,
                    color: a.color,
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: updatingStage ? 'default' : 'pointer',
                  }}
                  onMouseEnter={(e) => { if (!updatingStage) e.currentTarget.style.background = `${a.color}28` }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = `${a.color}14` }}
                >
                  {a.label}
                </button>
              ))}
              {(transitions[deal.stage] || []).length === 0 && (
                <span style={{ fontSize: '13px', color: '#a89f8f' }}>No further actions for this stage.</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Activity timeline */}
      <div style={{ ...cardStyle, padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem', color: '#2c2c2a' }}>Activity</h2>

        {/* Add note */}
        <div style={{ marginBottom: '1.5rem' }}>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note — call summary, WhatsApp update, anything worth remembering…"
            style={{
              width: '100%',
              minHeight: '70px',
              border: '1px solid #ece8e0',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '13.5px',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
              color: '#2c2c2a',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              onClick={saveNote}
              disabled={saving || !noteText.trim()}
              style={{
                background: noteText.trim() ? '#534AB7' : '#ece8e0',
                color: noteText.trim() ? '#fff' : '#a89f8f',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: noteText.trim() ? 'pointer' : 'default',
              }}
            >
              {saving ? 'Saving…' : 'Add note'}
            </button>
          </div>
        </div>

        {/* Timeline */}
        {activities.length === 0 ? (
          <p style={{ color: '#a89f8f', fontSize: '14px', padding: '1rem 0', textAlign: 'center' }}>No activity logged yet.</p>
        ) : (
          <div>
            {activities.map((a, i) => {
              const meta = activityTypeMeta[a.type] || { label: a.type, color: '#9a9488' }
              return (
                <div key={a.id} style={{ display: 'flex', gap: '12px', paddingBottom: i < activities.length - 1 ? '1rem' : 0, marginBottom: i < activities.length - 1 ? '1rem' : 0, borderBottom: i < activities.length - 1 ? '1px solid #f5f2ec' : 'none' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: meta.color, marginTop: '6px', flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: meta.color }}>{meta.label}</span>
                      <span style={{ fontSize: '12px', color: '#a89f8f' }}>
                        {new Date(a.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        {new Date(a.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {a.body && (
                      <p style={{ margin: 0, fontSize: '13.5px', color: '#5f5e5a', lineHeight: 1.6 }}>{a.body}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
