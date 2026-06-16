'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

interface Contact {
  id: string; name: string; email?: string; phone?: string
  source?: string; leadSource?: string; preferredLocation?: string; createdAt: string
}
interface Deal {
  id: string; stage: string; unitSize?: string; monthlyPrice?: number
  location?: string; preferredLocation?: string; category?: string
  storageType?: string; createdAt: string
  contact?: { value?: { name?: string } }
}
interface Activity {
  id: string; type?: string; activityType?: string; title?: string
  description?: string; notes?: string; subject?: string; createdAt: string
  contact?: { value?: { name?: string } }; contactName?: string
}

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  new_lead:          { label: 'New lead',          color: '#e86a2e' },
  quoted:            { label: 'Quoted',             color: '#f5a623' },
  viewing_scheduled: { label: 'Viewing scheduled', color: '#5b8af5' },
  active:            { label: 'Active',             color: '#2dd4a0' },
  churned:           { label: 'Churned',            color: '#f87171' },
  lost:              { label: 'Lost',               color: '#6b7280' },
}

const SOURCE_COLORS = ['#e86a2e','#2dd4a0','#5b8af5','#f5a623','#a78bfa','#34d399']
const SIZE_COLORS   = ['#e86a2e','#f5a623','#2dd4a0','#5b8af5','#a78bfa','#f87171']
const ACT_ICONS: Record<string,string> = { call:'📞', email:'✉️', meeting:'📅', note:'📝', quote:'💰' }

function fmtZAR(n: number): string {
  if (n >= 1_000_000) return `R${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `R${(n/1_000).toFixed(0)}K`
  return `R${Math.round(n)}`
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

async function fetchAll<T>(endpoint: string): Promise<T[]> {
  let page = 1, all: T[] = [], hasMore = true
  while (hasMore) {
    try {
      const r = await fetch(`/api/${endpoint}?limit=100&page=${page}`, { credentials: 'include' })
      if (!r.ok) break
      const d = await r.json()
      all = all.concat(d.docs || [])
      hasMore = d.hasNextPage || false
      page++
    } catch { break }
  }
  return all
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div style={{ background:'#1a1f35', border:'1px solid #2a2f45', borderRadius:10,
      padding:'14px 16px', borderTop:`3px solid ${accent}` }}>
      <div style={{ fontSize:10, color:'#8892aa', textTransform:'uppercase' as const, letterSpacing:'.5px', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, color:'#fff', lineHeight:1.1 }}>{value}</div>
      <div style={{ fontSize:10, color:'#5a6278', marginTop:4 }}>{sub}</div>
    </div>
  )
}

function Panel({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ background:'#1a1f35', border:'1px solid #2a2f45', borderRadius:10, padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:600, color:'#c8d0e0' }}>{title}</div>
        {sub && <div style={{ fontSize:10, color:'#8892aa' }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

export function PowerDashboard() {
  const [contacts,    setContacts]    = useState<Contact[]>([])
  const [deals,       setDeals]       = useState<Deal[]>([])
  const [activities,  setActivities]  = useState<Activity[]>([])
  const [loading,     setLoading]     = useState(true)
  const [lastRefresh, setLastRefresh] = useState('')
  const [periodFilter, setPeriodFilter] = useState('all')
  const [stageFilter,  setStageFilter]  = useState('all')
  const [sizeFilter,   setSizeFilter]   = useState('all')

  const loadData = useCallback(async () => {
    setLoading(true)
    const [c, d, a] = await Promise.all([
      fetchAll<Contact>('contacts'),
      fetchAll<Deal>('deals'),
      fetchAll<Activity>('activities'),
    ])
    setContacts(c); setDeals(d); setActivities(a)
    setLastRefresh(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    const t = setInterval(loadData, 120_000)
    return () => clearInterval(t)
  }, [loadData])

  const cutoff = periodFilter !== 'all' ? Date.now() - parseInt(periodFilter)*86_400_000 : 0

  const filteredDeals = deals.filter(d => {
    if (cutoff && new Date(d.createdAt).getTime() < cutoff) return false
    if (stageFilter !== 'all' && d.stage !== stageFilter) return false
    const sz = (d.unitSize||'').toLowerCase().replace(/\s/g,'')
    if (sizeFilter !== 'all' && sz !== sizeFilter) return false
    return true
  })
  const filteredContacts = contacts.filter(c =>
    cutoff ? new Date(c.createdAt).getTime() >= cutoff : true
  )

  const activeDeals = filteredDeals.filter(d => d.stage === 'active').length
  const totalLeads  = filteredContacts.length
  const convRate    = totalLeads > 0 ? ((activeDeals/totalLeads)*100).toFixed(1) : '0.0'
  const estMRR      = activeDeals * 1200

  const trendData = (() => {
    const now = new Date()
    const months = Array.from({length:6}, (_,i) => {
      const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
      return { month:d.toLocaleString('default',{month:'short'}), year:d.getFullYear(), mo:d.getMonth(), leads:0, active:0 }
    })
    filteredDeals.forEach(d => {
      const dt = new Date(d.createdAt)
      const m = months.find(x => x.year===dt.getFullYear() && x.mo===dt.getMonth())
      if (m) { m.leads++; if (d.stage==='active') m.active++ }
    })
    return months
  })()

  const stageCounts = Object.fromEntries(
    Object.keys(STAGE_CONFIG).map(s => [s, {
      count: filteredDeals.filter(d => d.stage===s).length,
      value: filteredDeals.filter(d => d.stage===s).reduce((a,d) => a+(d.monthlyPrice||1200),0),
    }])
  )
  const maxStageCount = Math.max(...Object.values(stageCounts).map(v => v.count), 1)

  const sizeCounts = (() => {
    const m: Record<string,number> = {}
    filteredDeals.forEach(d => { const s=d.unitSize||'Unknown'; m[s]=(m[s]||0)+1 })
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6)
  })()
  const maxSizeCount = sizeCounts[0]?.[1] || 1

  const donutData = Object.entries(stageCounts)
    .filter(([,v]) => v.count>0)
    .map(([s,v]) => ({ name:STAGE_CONFIG[s]?.label||s, value:v.count, color:STAGE_CONFIG[s]?.color }))

  const sourceCounts = (() => {
    const m: Record<string,number> = {}
    filteredContacts.forEach(c => { const s=c.source||c.leadSource||'Website'; m[s]=(m[s]||0)+1 })
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5)
  })()
  const totalSources = sourceCounts.reduce((a,[,v])=>a+v,0)||1

  const locationCounts = (() => {
    const m: Record<string,number> = {}
    filteredDeals.forEach(d => { const l=d.location||d.preferredLocation||'Johannesburg'; m[l]=(m[l]||0)+1 })
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5)
  })()
  const maxLocCount = locationCounts[0]?.[1] || 1

  const catMap: Record<string,string> = { personal:'Personal', business:'Business', student:'Student', vehicle:'Vehicle', other:'Other' }
  const catCounts = (() => {
    const m: Record<string,number> = {}
    filteredDeals.forEach(d => { const c=catMap[d.category||d.storageType||'personal']||'Other'; m[c]=(m[c]||0)+1 })
    return Object.entries(m).sort((a,b)=>b[1]-a[1])
  })()

  const recentActivity = [...activities]
    .sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
    .slice(0,8)

  const sel: React.CSSProperties = {
    background:'#0f1117', border:'1px solid #2a2f45', color:'#c8d0e0',
    fontSize:11, padding:'4px 10px', borderRadius:4, outline:'none',
  }
  const ttStyle = { background:'#1a1f35', border:'1px solid #2a2f45', borderRadius:6, fontSize:11 }

  return (
    <div style={{ background:'#0f1117', minHeight:'100vh', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', fontSize:13, color:'#fff' }}>

      {/* Top bar */}
      <div style={{ background:'#161b2e', borderBottom:'1px solid #2a2f45', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background:'#e86a2e', color:'#fff', fontWeight:700, fontSize:13, padding:'4px 12px', borderRadius:4, letterSpacing:1 }}>STOR24</div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>CRM Performance Dashboard</div>
            <div style={{ fontSize:11, color:'#8892aa' }}>Leads · Deals · Revenue · Activity</div>
          </div>
        </div>
        <div style={{ textAlign:'right', fontSize:11 }}>
          <div style={{ color:loading?'#f5a623':'#2dd4a0', display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:loading?'#f5a623':'#2dd4a0', display:'inline-block' }} />
            {loading ? 'Loading...' : 'Live from CMS'}
          </div>
          <div style={{ color:'#5a6278', marginTop:2, display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end' }}>
            {lastRefresh && `Last refresh: ${lastRefresh}`}
            <button onClick={loadData} style={{ background:'none', border:'1px solid #2a2f45', color:'#8892aa', padding:'2px 8px', borderRadius:4, cursor:'pointer', fontSize:11 }}>↺</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:'#161b2e', borderBottom:'1px solid #2a2f45', padding:'8px 20px', display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' as const }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:'#8892aa' }}>Period:</span>
          <select style={sel} value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}>
            <option value="all">All time</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:'#8892aa' }}>Stage:</span>
          <select style={sel} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
            <option value="all">All stages</option>
            {Object.entries(STAGE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:'#8892aa' }}>Unit size:</span>
          <select style={sel} value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
            <option value="all">All sizes</option>
            {['5sqm','10sqm','15sqm','20sqm','30sqm'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ marginLeft:'auto', fontSize:11, color:'#5a6278' }}>
          {filteredDeals.length} deals · {filteredContacts.length} contacts
        </div>
      </div>

      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column' as const, gap:14 }}>

        {/* KPI row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
          <KpiCard label="Total leads"       value={String(totalLeads)}        sub="all sources"          accent="#e86a2e" />
          <KpiCard label="Deals in pipeline" value={String(filteredDeals.length)} sub="all stages"        accent="#5b8af5" />
          <KpiCard label="Active tenants"    value={String(activeDeals)}       sub="paying units"         accent="#2dd4a0" />
          <KpiCard label="Est. MRR"          value={fmtZAR(estMRR)}            sub="avg R1,200/unit"      accent="#f5a623" />
          <KpiCard label="Conversion rate"   value={`${convRate}%`}            sub="lead → active"        accent="#a78bfa" />
        </div>

        {/* Row 2: Trend | Stages | Sizes */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12 }}>

          <Panel title="Deals trend" sub="last 6 months">
            <div style={{ display:'flex', gap:16, marginBottom:10 }}>
              {[['#e86a2e','New leads'],['#2dd4a0','Active deals']] .map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#8892aa' }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:c, display:'inline-block' }} />{l}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill:'#8892aa', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#8892aa', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ttStyle} labelStyle={{ color:'#c8d0e0' }} itemStyle={{ color:'#8892aa' }} />
                <Line type="monotone" dataKey="leads"  stroke="#e86a2e" strokeWidth={2} dot={{ r:3, fill:'#e86a2e' }} name="New leads" />
                <Line type="monotone" dataKey="active" stroke="#2dd4a0" strokeWidth={2} dot={{ r:3, fill:'#2dd4a0' }} strokeDasharray="5 3" name="Active" />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Deals by stage">
            {Object.entries(STAGE_CONFIG).map(([key,cfg]) => {
              const { count, value } = stageCounts[key] || { count:0, value:0 }
              return (
                <div key={key} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                  <div style={{ fontSize:11, color:'#c8d0e0', width:105, whiteSpace:'nowrap' as const, overflow:'hidden', textOverflow:'ellipsis' }}>{cfg.label}</div>
                  <div style={{ flex:1, background:'#0f1117', borderRadius:3, height:10, overflow:'hidden' }}>
                    <div style={{ width:`${(count/maxStageCount*100).toFixed(0)}%`, height:'100%', background:cfg.color, borderRadius:3, transition:'width .5s ease' }} />
                  </div>
                  <div style={{ fontSize:11, color:'#8892aa', minWidth:22, textAlign:'right' as const }}>{count}</div>
                  <div style={{ fontSize:11, color:'#e86a2e', minWidth:48, textAlign:'right' as const }}>{fmtZAR(value)}</div>
                </div>
              )
            })}
          </Panel>

          <Panel title="Unit sizes in demand">
            {sizeCounts.length === 0
              ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'20px 0' }}>No size data yet</div>
              : sizeCounts.map(([name,cnt],i) => (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ fontSize:11, color:'#c8d0e0', width:55 }}>{name}</div>
                  <div style={{ flex:1, background:'#0f1117', borderRadius:3, height:8, overflow:'hidden' }}>
                    <div style={{ width:`${(cnt/maxSizeCount*100).toFixed(0)}%`, height:'100%', background:SIZE_COLORS[i%SIZE_COLORS.length], borderRadius:3 }} />
                  </div>
                  <div style={{ fontSize:11, color:'#8892aa', minWidth:25, textAlign:'right' as const }}>{cnt}</div>
                </div>
              ))
            }
          </Panel>
        </div>

        {/* Row 3: Activity | Sources+Locations | Categories+Donut */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr', gap:12 }}>

          <Panel title="Recent activity" sub={`${activities.length} total`}>
            {recentActivity.length === 0
              ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'20px 0' }}>No activity yet</div>
              : recentActivity.map(a => {
                const type   = (a.type||a.activityType||'note').toLowerCase()
                const icon   = ACT_ICONS[type] || '⚡'
                const name   = a.contact?.value?.name || a.contactName || 'Contact'
                const desc   = a.description || a.notes || a.subject || type
                const colors: Record<string,string> = { call:'#e86a2e', email:'#2dd4a0', meeting:'#5b8af5', quote:'#a78bfa', note:'#f5a623' }
                const accent = colors[type] || '#8892aa'
                return (
                  <div key={a.id} style={{ display:'flex', gap:10, padding:'8px 0', borderBottom:'1px solid #1e2338' }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:`${accent}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>{icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:500, color:'#c8d0e0', whiteSpace:'nowrap' as const, overflow:'hidden', textOverflow:'ellipsis' }}>{name}</div>
                      <div style={{ fontSize:10, color:'#8892aa', marginTop:1, whiteSpace:'nowrap' as const, overflow:'hidden', textOverflow:'ellipsis' }}>{desc}</div>
                    </div>
                    <div style={{ fontSize:10, color:'#5a6278', whiteSpace:'nowrap' as const }}>{timeAgo(a.createdAt)}</div>
                  </div>
                )
              })
            }
          </Panel>

          <div style={{ display:'flex', flexDirection:'column' as const, gap:12 }}>
            <Panel title="Lead sources">
              {sourceCounts.length === 0
                ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'12px 0' }}>No source data</div>
                : sourceCounts.map(([name,cnt],i) => (
                  <div key={name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                    <div style={{ fontSize:11, color:'#c8d0e0', width:70, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{name}</div>
                    <div style={{ flex:1, background:'#0f1117', borderRadius:3, height:6, overflow:'hidden' }}>
                      <div style={{ width:`${(cnt/totalSources*100).toFixed(0)}%`, height:'100%', background:SOURCE_COLORS[i%SOURCE_COLORS.length], borderRadius:3 }} />
                    </div>
                    <div style={{ fontSize:11, color:'#8892aa' }}>{(cnt/totalSources*100).toFixed(0)}%</div>
                  </div>
                ))
              }
            </Panel>

            <Panel title="Locations">
              {locationCounts.length === 0
                ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'12px 0' }}>No location data</div>
                : locationCounts.map(([loc,cnt],i) => {
                  const badges = ['#2dd4a0','#e86a2e','#5b8af5','#f5a623','#a78bfa']
                  const c = badges[i%badges.length]
                  return (
                    <div key={loc} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:'1px solid #1e2338' }}>
                      <div style={{ fontSize:11, color:'#c8d0e0' }}>{loc}</div>
                      <div style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:`${c}22`, color:c }}>{(cnt/maxLocCount*100).toFixed(0)}%</div>
                      <div style={{ fontSize:11, color:'#e86a2e', fontWeight:600 }}>{cnt}</div>
                    </div>
                  )
                })
              }
            </Panel>
          </div>

          <Panel title="Storage categories">
            {catCounts.length === 0
              ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'12px 0' }}>No category data</div>
              : catCounts.map(([name,cnt],i) => (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:SOURCE_COLORS[i%SOURCE_COLORS.length], flexShrink:0, display:'inline-block' }} />
                  <div style={{ fontSize:11, color:'#c8d0e0', flex:1 }}>{name}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:'#fff' }}>{cnt}</div>
                </div>
              ))
            }
            {donutData.length > 0 && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:10, color:'#8892aa', marginBottom:6 }}>Stage distribution</div>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                      {donutData.map((entry,i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} itemStyle={{ color:'#c8d0e0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

        </div>
      </div>
    </div>
  )
}

export default PowerDashboard
