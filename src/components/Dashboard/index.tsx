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
    { label: 'Total contacts', value: stats.totalContacts, accent: '#378ADD', href: '/admin/collections/contacts' },
    { label: 'New leads', value: stats.newLeads, accent: '#1D9E75', href: '/admin/collections/deals' },
    { label: 'In progress', value: stats.inProgress, accent: '#EF9F27', href: '/admin/collections/deals' },
    { label: 'Active tenants', value: stats.active, accent: '#639922', href: '/admin/collections/deals' },
  ]

  const quickLinks = [
    { label: 'New contact', href: '/admin/collections/contacts/create' },
    { label: 'New deal', href: '/admin/collections/deals/create' },
    { label: 'Log activity', href: '/admin/collections/activities/create' },
  ]

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '2.5rem 2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin" style={{ fontSize: '13px', color: '#9a9488', textDecoration: 'none', letterSpacing: '0.02em' }}>
          ← Back to admin
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0, color: '#2c2c2a', letterSpacing: '-0.01em' }}>
            CRM dashboard
          </h1>
          <span style={{ fontSize: '13px', color: '#9a9488' }}>
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

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
              border: '1px solid #ece8e0',
              borderRadius: '14px',
              padding: '1.25rem 1.25rem 1.1rem',
              transition: 'border-color 0.15s, transform 0.1s',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d8d2c5' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ece8e0' }}
            >
              <div style={{
                width: '32px', height: '4px', borderRadius: '2px',
                background: s.accent, marginBottom: '0.9rem',
              }} />
              <p style={{ fontSize: '13px', color: '#8a8478', margin: '0 0 6px', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: '2.25rem', fontWeight: 600, color: '#2c2c2a', margin: 0, lineHeight: 1 }}>
                {loading ? '–' : s.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {quickLinks.map((l) => (
          <Link key={l.label} href={l.href} style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0.7rem',
            background: '#fff',
            border: '1px solid #ece8e0',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '13.5px',
            color: '#534AB7',
            fontWeight: 500,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f7f5f0' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>+</span> {l.label}
          </Link>
        ))}
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #ece8e0',
        borderRadius: '14px',
        padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#2c2c2a' }}>Recent contacts</h2>
          <Link href='/admin/collections/contacts' style={{ fontSize: '13px', color: '#534AB7', textDecoration: 'none', fontWeight: 500 }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <p style={{ color: '#9a9488', fontSize: '14px', padding: '1rem 0' }}>Loading…</p>
        ) : recentContacts.length === 0 ? (
          <p style={{ color: '#9a9488', fontSize: '14px', padding: '1rem 0' }}>No contacts yet. New leads will appear here automatically.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Source', 'Status', 'Created'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '0 0 10px',
                    color: '#9a9488', fontWeight: 500, fontSize: '12px',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                    borderBottom: '1px solid #ece8e0',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentContacts.map((c) => {
                const sc = statusColor[c.status] || { bg: '#f1efe8', text: '#5f5e5a' }
                return (
                  <tr key={c.id}>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid #f5f2ec' }}>
                      <Link href={`/admin/collections/contacts/${c.id}`} style={{ textDecoration: 'none', color: '#2c2c2a', fontWeight: 500 }}>
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid #f5f2ec', color: '#534AB7' }}>{c.email}</td>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid #f5f2ec', textTransform: 'capitalize', color: '#5f5e5a' }}>
                      {c.source?.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid #f5f2ec' }}>
                      <span style={{
                        background: sc.bg, color: sc.text,
                        padding: '3px 12px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: 500, textTransform: 'capitalize',
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', borderBottom: '1px solid #f5f2ec', color: '#9a9488' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
