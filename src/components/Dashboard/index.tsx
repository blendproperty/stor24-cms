'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Stats = {
  totalContacts: number
  newLeads: number
  inProgress: number
  active: number
}

type Contact = {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  source: string
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

const icons: Record<string, React.ReactNode> = {
  contacts: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  leads: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
    </svg>
  ),
  progress: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  active: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalContacts: 0, newLeads: 0, inProgress: 0, active: 0 })
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [contactsRes, dealsRes] = await Promise.all([
        fetch('/api/contacts?limit=5&sort=-createdAt'),
        fetch('/api/deals?limit=100'),
      ])
      const contactsData = await contactsRes.json()
      const dealsData = await dealsRes.json()

      const deals = dealsData.docs || []
      setStats({
        totalContacts: contactsData.totalDocs || 0,
        newLeads: deals.filter((d: any) => d.stage === 'new_lead').length,
        inProgress: deals.filter((d: any) => ['quoted', 'viewing_scheduled'].includes(d.stage)).length,
        active: deals.filter((d: any) => d.stage === 'active').length,
      })
      setRecentContacts(contactsData.docs || [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { key: 'contacts', label: 'Total contacts', value: stats.totalContacts, color: '#378ADD', bg: '#E6F1FB', href: '/admin/collections/contacts' },
    { key: 'leads', label: 'New leads', value: stats.newLeads, color: '#1D9E75', bg: '#E1F5EE', href: '/admin/collections/deals' },
    { key: 'progress', label: 'In progress', value: stats.inProgress, color: '#EF9F27', bg: '#FAEEDA', href: '/admin/collections/deals' },
    { key: 'active', label: 'Active tenants', value: stats.active, color: '#639922', bg: '#EAF3DE', href: '/admin/collections/deals' },
  ]

  const quickLinks = [
    { label: 'New contact', href: '/admin/collections/contacts/create' },
    { label: 'New deal', href: '/admin/collections/deals/create' },
    { label: 'Log activity', href: '/admin/collections/activities/create' },
  ]

  const initials = (c: Contact) => `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div style={{
      maxWidth: '1140px',
      margin: '0 auto',
      padding: '2.5rem 2rem 4rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ fontSize: '13px', color: '#a89f8f', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to admin
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.85rem' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, margin: 0, color: '#2c2c2a', letterSpacing: '-0.02em' }}>
            CRM dashboard
          </h1>
          <span style={{ fontSize: '13px', color: '#a89f8f', fontWeight: 500 }}>
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {statCards.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '1.35rem',
              boxShadow: '0 1px 2px rgba(40,30,10,0.04), 0 4px 16px rgba(40,30,10,0.04)',
              border: '1px solid rgba(40,30,10,0.04)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(40,30,10,0.06), 0 8px 24px rgba(40,30,10,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(40,30,10,0.04), 0 4px 16px rgba(40,30,10,0.04)'
            }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                {icons[s.key]}
              </div>
              <p style={{ fontSize: '13px', color: '#9a9488', margin: '0 0 4px', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#2c2c2a', margin: 0, lineHeight: 1.1 }}>
                {loading ? '–' : s.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.75rem',
      }}>
        {quickLinks.map((l) => (
          <Link key={l.label} href={l.href} style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0.85rem',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(40,30,10,0.04), 0 4px 16px rgba(40,30,10,0.04)',
            border: '1px solid rgba(40,30,10,0.04)',
            textDecoration: 'none',
            fontSize: '13.5px',
            color: '#534AB7',
            fontWeight: 600,
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Recent Contacts */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(40,30,10,0.04), 0 4px 16px rgba(40,30,10,0.04)',
        border: '1px solid rgba(40,30,10,0.04)',
        padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#2c2c2a' }}>Recent contacts</h2>
          <Link href='/admin/collections/contacts' style={{ fontSize: '13px', color: '#534AB7', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#a89f8f', fontSize: '14px', padding: '2rem 0', textAlign: 'center' }}>Loading…</p>
        ) : recentContacts.length === 0 ? (
          <p style={{ color: '#a89f8f', fontSize: '14px', padding: '2rem 0', textAlign: 'center' }}>No contacts yet. New leads will appear here automatically.</p>
        ) : (
          <div>
            {recentContacts.map((c, i) => {
              const sc = statusColor[c.status] || { bg: '#f1efe8', text: '#5f5e5a' }
              return (
                <Link key={c.id} href={`/admin/collections/contacts/${c.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '0.9rem 0.5rem',
                    borderBottom: i < recentContacts.length - 1 ? '1px solid #f5f2ec' : 'none',
                    borderRadius: '8px',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#faf8f4' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: '#EEEDFE', color: '#534AB7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {initials(c)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#2c2c2a' }}>
                        {c.firstName} {c.lastName}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#a89f8f' }}>
                        {c.email}
                      </p>
                    </div>
                    <span style={{ fontSize: '12.5px', color: '#9a9488', minWidth: '80px', textAlign: 'right' }}>
                      {sourceLabel[c.source] || c.source}
                    </span>
                    <span style={{
                      background: sc.bg, color: sc.text,
                      padding: '4px 12px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                      minWidth: '72px', textAlign: 'center',
                    }}>
                      {c.status}
                    </span>
                    <span style={{ fontSize: '12.5px', color: '#a89f8f', minWidth: '50px', textAlign: 'right' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
