'use client'
import React, { useEffect, useState, useCallback } from 'react'

export function InventoryOps() {
  const [units, setUnits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/units?limit=100&depth=1', { credentials: 'include' })
      const d = await r.json()
      setUnits(d.docs || [])
    } catch(e) {}
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh', color: '#fff', padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Inventory Operations</div>
      {loading && <div>Loading...</div>}
      {!loading && units.length === 0 && <div style={{ color: '#5a6278' }}>No units yet. Add units in the Inventory section.</div>}
      {units.map(u => (
        <div key={u.id} style={{ background: '#1a1f35', border: '1px solid #2a2f45', borderRadius: 8, padding: '12px 16px', marginBottom: 8, display: 'flex', gap: 16 }}>
          <div style={{ fontWeight: 700 }}>{u.unitNumber}</div>
          <div style={{ color: '#8892aa' }}>{u.location}</div>
          <div style={{ color: '#8892aa' }}>{u.size}</div>
          <div style={{ color: u.status === 'occupied' ? '#e86a2e' : u.status === 'available' ? '#2dd4a0' : '#5b8af5' }}>{u.status}</div>
        </div>
      ))}
    </div>
  )
}

export default InventoryOps
