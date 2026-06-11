'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Stats = {
  totalContacts: number
  newLeads: number
  activeDeals: number
  converted: number
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

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalContacts: 0, newLeads: 0, activeDeals: 0, converted: 0 })
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])

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
        activeDeals: deals.filter((d: any) => d.stage === 'active').length,
        converted: deals.filter((d: any) => d.stage === 'converted').length,
      })
      setRecentContacts(contactsData.docs || [])
    }
    load()
  }, [])

  const statusColor: Record<string, string> = {
    new: '#1D9E75',
    quoted: '#378ADD',
    viewing: '#EF9F27',
    converted: '#639922',
    lost: '#E24B4A',
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>

      {/* Back link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ fontSize: '13px', color: '#888', textDecoration: 'none' }}>
          ← Back to Admin
        </Link>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '1.5rem' }}>CRM Dashboard</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Contacts', value: stats.totalContacts, color: '#378ADD', href: '/admin/collections/contacts' },
          { label: 'New Leads', value: stats.newLeads, color: '#1D9E75', href: '/admin/collections/deals' },
          { label: 'Active Tenants', value: stats.activeDeals, color: '#639922', href: '/admin/collections/deals' },
          { label: 'Converted', value: stats.converted, color: '#EF9F27', href: '/admin/collections/deals' },
        ].map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer' }}>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 6px' }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 500, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: '+ New Contact', href: '/admin/collections/contacts/create' },
          { label: '+ New Deal', href: '/admin/collections/deals/create' },
          { label: '+ Log Activity', href: '/admin/collections/activities/create' },
        ].map((l) => (
          <Link key={l.label} href={l.href} style={{
            display: 'block',
            textAlign: 'center',
            padding: '10px',
            background: '#fff',
            border: '0.5px solid #e0e0e0',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            color: '#378ADD',
            fontWeight: 500,
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Recent Contacts */}
      <div style={{ background: '#fff', border: '0.5px solid #e0e0e0', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500, margin: 0 }}>Recent Contacts</h2>
          <Link href='/admin/collections/contacts' style={{ fontSize: '13px', color: '#378ADD', textDecoration: 'none' }}>View all →</Link>
        </div>
        {recentContacts.length === 0 ? (
          <p style={{ color: '#888', fontSize: '14px' }}>No contacts yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #e0e0e0' }}>
                {['Name', 'Email', 'Source', 'Status', 'Created'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 0', color: '#888', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentContacts.map((c) => (
                <tr key={c.id} style={{ borderBottom: '0.5px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 0' }}>
                    <Link href={`/admin/collections/contacts/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td style={{ padding: '10px 0', color: '#378ADD' }}>{c.email}</td>
                  <td style={{ padding: '10px 0', textTransform: 'capitalize' }}>{c.source?.replace('_', ' ')}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{ background: statusColor[c.status] + '22', color: statusColor[c.status], padding: '2px 10px', borderRadius: '20px', fontSize: '12px' }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 0', color: '#888' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
