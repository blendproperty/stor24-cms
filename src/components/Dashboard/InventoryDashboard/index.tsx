'use client'

import React, { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

interface Unit {
  id: string
  unitNumber: string
  location: string
  size: string
  floor?: string
  status: string
  monthlyRate?: number
  contractStart?: string
  contractEnd?: string
  tenant?: { value?: { name?: string } }
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  available:   { label: 'Available',   color: '#2dd4a0' },
  occupied:    { label: 'Occupied',    color: '#e86a2e' },
  reserved:    { label: 'Reserved',    color: '#5b8af5' },
  maintenance: { label: 'Maintenance', color: '#f87171' },
}

const LOCATION_COLORS = ['#e86a2e','#2dd4a0','#5b8af5','#f5a623','#a78bfa']
const SIZE_COLORS     = ['#e86a2e','#f5a623','#2dd4a0','#5b8af5','#a78bfa','#f87171']

function fmtZAR(n: number): string {
  if (n >= 1_000_000) return `R${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `R${(n/1_000).toFixed(0)}K`
  return `R${Math.round(n)}`
}

function daysLeft(dateStr?: string): number | null {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
}

async function fetchAll<T>(endpoint: string): Promise<T[]> {
  let page = 1, all: T[] = [], hasMore = true
  while (hasMore) {
    try {
      const r = await fetch(`/api/${endpoint}?limit=100&page=${page}&depth=1`, { credentials: 'include' })
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
    <div style={{ background:'#1a1f35', border:'1px solid #2a2f45', borderRadius:10, padding:'14px 16px', borderTop:`3px solid ${accent}` }}>
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

export function InventoryDashboard() {
  const [units,      setUnits]      = useState<Unit[]>([])
  const [loading,    setLoading]    = useState(true)
  const [lastRefresh, setLastRefresh] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [sizeFilter,     setSizeFilter]     = useState('all')

  const loadData = useCallback(async () => {
    setLoading(true)
    const u = await fetchAll<Unit>('units')
    setUnits(u)
    setLastRefresh(new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    const t = setInterval(loadData, 120_000)
    return () => clearInterval(t)
  }, [loadData])

  const filtered = units.filter(u => {
    if (locationFilter !== 'all' && u.location !== locationFilter) return false
    if (statusFilter   !== 'all' && u.status   !== statusFilter)   return false
    if (sizeFilter     !== 'all' && u.size      !== sizeFilter)     return false
    return true
  })

  const total       = filtered.length
  const occupied    = filtered.filter(u => u.status === 'occupied').length
  const available   = filtered.filter(u => u.status === 'available').length
  const reserved    = filtered.filter(u => u.status === 'reserved').length
  const maintenance = filtered.filter(u => u.status === 'maintenance').length
  const occupancy   = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0.0'
  const totalMRR    = filtered.filter(u => u.status === 'occupied').reduce((a, u) => a + (u.monthlyRate || 0), 0)
  const avgRate     = occupied > 0 ? totalMRR / occupied : 0

  // Stock in/out by location
  const locationData = (() => {
    const m: Record<string, { occupied: number; available: number }> = {}
    filtered.forEach(u => {
      if (!m[u.location]) m[u.location] = { occupied:0, available:0 }
      if (u.status === 'occupied')  m[u.location].occupied++
      if (u.status === 'available') m[u.location].available++
    })
    return Object.entries(m).map(([name, v]) => ({ name, ...v }))
  })()

  // Value by size
  const sizeData = (() => {
    const m: Record<string, number> = {}
    filtered.filter(u => u.status === 'occupied').forEach(u => {
      m[u.size] = (m[u.size] || 0) + (u.monthlyRate || 0)
    })
    return Object.entries(m).sort((a,b) => b[1]-a[1])
  })()

  // Status donut
  const donutData = Object.entries(STATUS_CONFIG)
    .map(([s, cfg]) => ({ name: cfg.label, value: filtered.filter(u => u.status === s).length, color: cfg.color }))
    .filter(d => d.value > 0)

  // Value by location for bar chart
  const locationValueData = (() => {
    const m: Record<string, number> = {}
    filtered.filter(u => u.status === 'occupied').forEach(u => {
      m[u.location] = (m[u.location] || 0) + (u.monthlyRate || 0)
    })
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a,b) => b.value-a.value)
  })()

  // Expiring contracts (next 60 days)
  const expiring = filtered
    .filter(u => u.contractEnd && (daysLeft(u.contractEnd) || 999) <= 60 && u.status === 'occupied')
    .sort((a, b) => new Date(a.contractEnd!).getTime() - new Date(b.contractEnd!).getTime())
    .slice(0, 8)

  // Low availability locations
  const lowAvailability = locationData
    .filter(l => (l.occupied + l.available) > 0)
    .map(l => ({ ...l, pct: ((l.occupied / (l.occupied + l.available)) * 100) }))
    .filter(l => l.pct >= 80)

  const sel: React.CSSProperties = {
    background:'#0f1117', border:'1px solid #2a2f45', color:'#c8d0e0',
    fontSize:11, padding:'4px 10px', borderRadius:4, outline:'none',
  }
  const ttStyle = { background:'#1a1f35', border:'1px solid #2a2f45', borderRadius:6, fontSize:11 }

  const locations = [...new Set(units.map(u => u.location))]
  const sizes     = [...new Set(units.map(u => u.size))]

  return (
    <div style={{ background:'#0f1117', minHeight:'100vh', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', fontSize:13, color:'#fff' }}>

      {/* Top bar */}
      <div style={{ background:'#161b2e', borderBottom:'1px solid #2a2f45', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ background:'#e86a2e', color:'#fff', fontWeight:700, fontSize:13, padding:'4px 12px', borderRadius:4, letterSpacing:1 }}>STOR24</div>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:'#fff' }}>Inventory Management Dashboard</div>
            <div style={{ fontSize:11, color:'#8892aa' }}>Units · Occupancy · Revenue · Contracts</div>
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
          <span style={{ fontSize:11, color:'#8892aa' }}>Location:</span>
          <select style={sel} value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
            <option value="all">All locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:'#8892aa' }}>Status:</span>
          <select style={sel} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:'#8892aa' }}>Size:</span>
          <select style={sel} value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
            <option value="all">All sizes</option>
            {sizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ marginLeft:'auto', fontSize:11, color:'#5a6278' }}>{filtered.length} units</div>
      </div>

      <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column' as const, gap:14 }}>

        {/* KPI row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
          <KpiCard label="Total units"      value={String(total)}         sub="all locations"       accent="#5b8af5" />
          <KpiCard label="Total inventory value" value={fmtZAR(totalMRR)} sub="occupied MRR"       accent="#e86a2e" />
          <KpiCard label="Stock in (occupied)" value={String(occupied)}   sub={`+${reserved} reserved`} accent="#2dd4a0" />
          <KpiCard label="Stock out (available)" value={String(available)} sub={`${maintenance} maintenance`} accent="#f5a623" />
          <KpiCard label="Occupancy rate"   value={`${occupancy}%`}       sub="occupied / total"    accent="#a78bfa" />
        </div>

        {/* Row 2 */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12 }}>

          {/* Occupied vs Available by location */}
          <Panel title="Stock in vs stock out" sub="by location">
            <div style={{ display:'flex', gap:16, marginBottom:10 }}>
              {[['#e86a2e','Occupied'],['#2dd4a0','Available']].map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#8892aa' }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:c, display:'inline-block' }} />{l}
                </div>
              ))}
            </div>
            {locationData.length === 0
              ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'40px 0' }}>No units added yet — add units in the Inventory section</div>
              : <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill:'#8892aa', fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#8892aa', fontSize:10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={ttStyle} labelStyle={{ color:'#c8d0e0' }} itemStyle={{ color:'#8892aa' }} />
                    <Bar dataKey="occupied"  fill="#e86a2e" radius={[3,3,0,0]} name="Occupied" />
                    <Bar dataKey="available" fill="#2dd4a0" radius={[3,3,0,0]} name="Available" />
                  </BarChart>
                </ResponsiveContainer>
            }
          </Panel>

          {/* Inventory value by category (size) */}
          <Panel title="Inventory value by size">
            {sizeData.length === 0
              ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'20px 0' }}>No occupied units</div>
              : sizeData.map(([name, val], i) => (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                  <div style={{ fontSize:11, color:'#c8d0e0', width:55 }}>{name}</div>
                  <div style={{ flex:1, background:'#0f1117', borderRadius:3, height:10, overflow:'hidden' }}>
                    <div style={{ width:`${(val/Math.max(...sizeData.map(s=>s[1]))*100).toFixed(0)}%`, height:'100%', background:SIZE_COLORS[i%SIZE_COLORS.length], borderRadius:3 }} />
                  </div>
                  <div style={{ fontSize:11, color:'#e86a2e', minWidth:45, textAlign:'right' as const }}>{fmtZAR(val)}</div>
                </div>
              ))
            }
            {donutData.length > 0 && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:10, color:'#8892aa', marginBottom:6 }}>Status distribution</div>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={2}>
                      {donutData.map((e,i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={ttStyle} itemStyle={{ color:'#c8d0e0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Inventory value by location */}
          <Panel title="Value by location">
            {locationValueData.length === 0
              ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'20px 0' }}>No revenue data</div>
              : locationValueData.map(({ name, value }, i) => (
                <div key={name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                  <div style={{ fontSize:11, color:'#c8d0e0', width:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{name}</div>
                  <div style={{ flex:1, background:'#0f1117', borderRadius:3, height:10, overflow:'hidden' }}>
                    <div style={{ width:`${(value/Math.max(...locationValueData.map(l=>l.value))*100).toFixed(0)}%`, height:'100%', background:LOCATION_COLORS[i%LOCATION_COLORS.length], borderRadius:3 }} />
                  </div>
                  <div style={{ fontSize:11, color:'#e86a2e', minWidth:45, textAlign:'right' as const }}>{fmtZAR(value)}</div>
                </div>
              ))
            }
          </Panel>
        </div>

        {/* Row 3 */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:12 }}>

          {/* Expiring contracts table */}
          <Panel title="Expiring contracts" sub="next 60 days">
            {expiring.length === 0
              ? <div style={{ fontSize:11, color:'#5a6278', textAlign:'center' as const, padding:'20px 0' }}>No contracts expiring soon</div>
              : <>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 70px 70px 70px', gap:8, marginBottom:8, fontSize:10, color:'#5a6278', borderBottom:'1px solid #2a2f45', paddingBottom:6 }}>
                    <div>Tenant</div><div>Unit</div><div>Size</div><div>Expiry</div><div style={{ textAlign:'right' as const }}>Days left</div>
                  </div>
                  {expiring.map(u => {
                    const days = daysLeft(u.contractEnd)
                    const color = days !== null && days <= 14 ? '#f87171' : days !== null && days <= 30 ? '#f5a623' : '#2dd4a0'
                    return (
                      <div key={u.id} style={{ display:'grid', gridTemplateColumns:'1fr 80px 70px 70px 70px', gap:8, marginBottom:8, fontSize:11, alignItems:'center' }}>
                        <div style={{ color:'#c8d0e0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{u.tenant?.value?.name || 'Unknown'}</div>
                        <div style={{ color:'#8892aa' }}>{u.unitNumber}</div>
                        <div style={{ color:'#8892aa' }}>{u.size}</div>
                        <div style={{ color:'#8892aa', fontSize:10 }}>{u.contractEnd ? new Date(u.contractEnd).toLocaleDateString('en-ZA',{day:'2-digit',month:'short'}) : '—'}</div>
                        <div style={{ textAlign:'right' as const, color, fontWeight:600 }}>{days !== null ? `${days}d` : '—'}</div>
                      </div>
                    )
                  })}
                </>
            }
          </Panel>

          {/* Low availability alert */}
          <Panel title="Low availability alert" sub="≥80% occupied">
            {lowAvailability.length === 0
              ? <div style={{ fontSize:11, color:'#2dd4a0', textAlign:'center' as const, padding:'20px 0' }}>✓ All locations have good availability</div>
              : lowAvailability.map((l, i) => (
                <div key={l.name} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ fontSize:11, color:'#c8d0e0' }}>{l.name}</div>
                    <div style={{ fontSize:11, color: l.pct >= 95 ? '#f87171' : '#f5a623', fontWeight:600 }}>{l.pct.toFixed(0)}%</div>
                  </div>
                  <div style={{ background:'#0f1117', borderRadius:3, height:8, overflow:'hidden' }}>
                    <div style={{ width:`${l.pct.toFixed(0)}%`, height:'100%', background: l.pct >= 95 ? '#f87171' : '#f5a623', borderRadius:3 }} />
                  </div>
                  <div style={{ fontSize:10, color:'#5a6278', marginTop:3 }}>{l.occupied} occupied · {l.available} available</div>
                </div>
              ))
            }
          </Panel>

          {/* Bottom KPIs */}
          <div style={{ display:'flex', flexDirection:'column' as const, gap:10 }}>
            {[
              { label:'Total locations',      value: String(locations.length),  sub:'active',           accent:'#2dd4a0' },
              { label:'Avg monthly rate',     value: fmtZAR(avgRate),           sub:'per occupied unit', accent:'#e86a2e' },
              { label:'Occupancy rate',       value: `${occupancy}%`,           sub:'stock availability', accent:'#a78bfa' },
            ].map(k => <KpiCard key={k.label} {...k} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryDashboard
