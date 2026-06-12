'use client'
import React, { useEffect, useState, useRef } from 'react'
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
  phone?: string
  status: string
  source: string
  createdAt: string
}

type Deal = {
  id: string
  contact: Contact | string
  stage: string
  unitSize?: string
  updatedAt: string
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
  inbox: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  ),
  sparkle: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  ),
}

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  boxShadow: '0 1px 2px rgba(40,30,10,0.04), 0 4px 16px rgba(40,30,10,0.04)',
  border: '1px solid rgba(40,30,10,0.04)',
}

// Animated count-up number
const AnimatedNumber = ({ value, loading }: { value: number; loading: boolean }) => {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    if (loading) return
    const start = prevValue.current
    const end = value
    const duration = 600
    const startTime = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) requestAnimationFrame(tick)
      else prevValue.current = end
    }
    requestAnimationFrame(tick)
  }, [value, loading])

  return <>{loading ? '–' : display}</>
}

// 7-day leads chart (lightweight SVG, no deps)
const LeadsChart = ({ contacts, loading }: { contacts: Contact[]; loading: boolean }) => {
  const days: { label: string; count: number; isToday: boolean }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const count = contacts.filter((c) => {
      const cd = new Date(c.createdAt)
      cd.setHours(0, 0, 0, 0)
      return cd.getTime() === d.getTime()
    }).length
    days.push({
      label: d.toLocaleDateString('en-ZA', { weekday: 'short' }),
      count,
      isToday: i === 0,
    })
  }

  const max = Math.max(...days.map((d) => d.count), 1)
  const chartHeight = 100

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: `${chartHeight + 28}px`, padding: '0 4px' }}>
      {days.map((d, i) => {
        const barHeight = loading ? 4 : Math.max((d.count / max) * chartHeight, d.count > 0 ? 6 : 2)
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{ position: 'relative', width: '100%', height: `${chartHeight}px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              {d.count > 0 && !loading && (
                <span style={{ position: 'absolute', top: `${chartHeight - barHeight - 18}px`, fontSize: '11px', fontWeight: 700, color: '#534AB7' }}>
                  {d.count}
                </span>
              )}
              <div
                style={{
                  width: '70%',
                  maxWidth: '28px',
                  height: `${barHeight}px`,
                  background: d.isToday ? '#534AB7' : '#CECBF6',
                  borderRadius: '6px 6px 2px 2px',
                  transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
            </div>
            <span style={{ fontSize: '11px', color: '#a89f8f', fontWeight: d.isToday ? 700 : 500 }}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalContacts: 0, newLeads: 0, inProgress: 0, active: 0 })
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const load = async () => {
    const [contactsRes, allContactsRes, dealsRes] = await Promise.all([
      fetch('/api/contacts?limit=5&sort=-createdAt'),
      fetch('/api/contacts?limit=200&sort=-createdAt'),
      fetch('/api/deals?limit=100&sort=-updatedAt&depth=1'),
    ])
    const contactsData = await contactsRes.json()
    const allContactsData = await allContactsRes.json()
    const dealsData = await dealsRes.json()

    const dealDocs: Deal[] = dealsData.docs || []
    setStats({
      totalContacts: contactsData.totalDocs || 0,
      newLeads: dealDocs.filter((d) => d.stage === 'new_lead').length,
      inProgress: dealDocs.filter((d) => ['quoted', 'viewing_scheduled'].includes(d.stage)).length,
      active: dealDocs.filter((d) => d.stage === 'active').length,
    })
    setRecentContacts(contactsData.docs || [])
    setAllContacts(allContactsData.docs || [])
    setDeals(dealDocs.filter((d) => !['churned', 'lost'].includes(d.stage)))
    setLoading(false)
  }

  useEffect(() => {
    load()
    setTimeout(() => setMounted(true), 50)
  }, [])

  const updateStage = async (dealId: string, newStage: string) => {
    setUpdatingId(dealId)
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stage: newStage }),
      })
      await load()
    } finally {
      setUpdatingId(null)
    }
  }

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

  // "This week" summary
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const leadsThisWeek = allContacts.filter((c) => new Date(c.createdAt) >= sevenDaysAgo).length
  const activeThisWeek = deals.filter((d) => d.stage === 'active' && new Date(d.updatedAt) >= sevenDaysAgo).length
  const lostThisWeek = deals.filter((d) => d.stage === 'lost' && new Date(d.updatedAt) >= sevenDaysAgo).length

  const fadeStyle = (delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(8px)',
    transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
  })

  return (
    <div style={{
      background: '#FAF8F4',
      margin: '-2rem',
      padding: '0',
      minHeight: '100vh',
    }}>
      <div style={{
        maxWidth: '1140px',
        margin: '0 auto',
        padding: '2.5rem 2rem 4rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        {/* Branding header */}
        <div style={{ marginBottom: '1.75rem', ...fadeStyle(0) }}>
          <Link href="/admin" style={{ fontSize: '13px', color: '#a89f8f', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to admin
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #D85A30, #F0997B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em',
              }}>
                S
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#2c2c2a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Stor24 CRM
                </h1>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#a89f8f' }}>Customer pipeline overview</p>
              </div>
            </div>
            <span style={{ fontSize: '13px', color: '#a89f8f', fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>

        {/* This week summary strip */}
        <div style={{
          ...cardStyle,
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, #3C3489, #534AB7)',
          color: '#fff',
          border: 'none',
          ...fadeStyle(60),
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icons.sparkle}
          </div>
          <div style={{ flex: 1, fontSize: '13.5px', lineHeight: 1.5 }}>
            <strong>{loading ? '–' : leadsThisWeek}</strong> new lead{leadsThisWeek === 1 ? '' : 's'} this week
            {activeThisWeek > 0 && <> · <strong>{activeThisWeek}</strong> moved to active</>}
            {lostThisWeek > 0 && <> · <strong>{lostThisWeek}</strong> marked lost</>}
            {!loading && leadsThisWeek === 0 && activeThisWeek === 0 && lostThisWeek === 0 && <> · quiet week so far</>}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
          ...fadeStyle(120),
        }}>
          {statCards.map((s) => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
              <div style={{
                ...cardStyle,
                padding: '1.35rem',
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
                  <AnimatedNumber value={s.value} loading={loading} />
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Chart + Quick actions row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.5rem', ...fadeStyle(180) }}>
          <div style={{ ...cardStyle, padding: '1.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#2c2c2a' }}>New leads, last 7 days</h2>
              <span style={{ fontSize: '12px', color: '#a89f8f' }}>
                {loading ? '' : `${leadsThisWeek} total`}
              </span>
            </div>
            <LeadsChart contacts={allContacts} loading={loading} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {quickLinks.map((l) => (
              <Link key={l.label} href={l.href} style={{
                ...cardStyle,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0.85rem',
                borderRadius: '12px',
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
        </div>

        {/* Deals pipeline */}
        <div style={{ ...cardStyle, padding: '1.5rem', marginBottom: '1.5rem', ...fadeStyle(240) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#2c2c2a' }}>Deals pipeline</h2>
            <Link href='/admin/collections/deals' style={{ fontSize: '13px', color: '#534AB7', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {loading ? (
            <p style={{ color: '#a89f8f', fontSize: '14px', padding: '2rem 0', textAlign: 'center' }}>Loading…</p>
          ) : deals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#cfc8b8' }}>
              {icons.inbox}
              <p style={{ margin: '0.75rem 0 0', fontSize: '14px', color: '#a89f8f' }}>No active deals in the pipeline.</p>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#cfc8b8' }}>New leads from your website will appear here automatically.</p>
            </div>
          ) : (
            <div>
              {deals.map((d, i) => {
                const contact = typeof d.contact === 'object' ? d.contact : null
                const meta = stageMeta[d.stage] || { label: d.stage, bg: '#f1efe8', text: '#5f5e5a' }
                const actions = transitions[d.stage] || []
                const isUpdating = updatingId === d.id

                return (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '0.9rem 0.5rem',
                    borderBottom: i < deals.length - 1 ? '1px solid #f5f2ec' : 'none',
                    opacity: isUpdating ? 0.5 : 1,
                    transition: 'opacity 0.15s',
                  }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: '#EEEDFE', color: '#534AB7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {contact ? `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase() : '?'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {contact ? (
                        <Link href={`/admin/crm-dashboard/contact?id=${contact.id}`} style={{ textDecoration: 'none' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#2c2c2a' }}>
                            {contact.firstName} {contact.lastName}
                          </p>
                        </Link>
                      ) : (
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#2c2c2a' }}>Unknown contact</p>
                      )}
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#a89f8f' }}>
                        {contact?.email}{contact?.phone ? ` · ${contact.phone}` : ''}{d.unitSize ? ` · ${d.unitSize}` : ''}
                      </p>
                    </div>

                    <span style={{
                      background: meta.bg, color: meta.text,
                      padding: '4px 12px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: 600,
                      minWidth: '120px', textAlign: 'center', flexShrink: 0,
                    }}>
                      {meta.label}
                    </span>

                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      {actions.map((a) => (
                        <button
                          key={a.next}
                          disabled={isUpdating}
                          onClick={() => updateStage(d.id, a.next)}
                          style={{
                            border: `1px solid ${a.color}33`,
                            background: `${a.color}14`,
                            color: a.color,
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: isUpdating ? 'default' : 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={(e) => { if (!isUpdating) e.currentTarget.style.background = `${a.color}28` }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = `${a.color}14` }}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Contacts */}
        <div style={{ ...cardStyle, padding: '1.5rem', ...fadeStyle(300) }}>
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
            <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#cfc8b8' }}>
              {icons.contacts}
              <p style={{ margin: '0.75rem 0 0', fontSize: '14px', color: '#a89f8f' }}>No contacts yet.</p>
              <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#cfc8b8' }}>New leads will appear here automatically.</p>
            </div>
          ) : (
            <div>
              {recentContacts.map((c, i) => {
                const sc = statusColor[c.status] || { bg: '#f1efe8', text: '#5f5e5a' }
                return (
                  <Link key={c.id} href={`/admin/crm-dashboard/contact?id=${c.id}`} style={{ textDecoration: 'none' }}>
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
    </div>
  )
}
