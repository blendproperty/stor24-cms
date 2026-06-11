'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const DashboardNav = () => {
  const pathname = usePathname()
  const isActive = pathname === '/admin/crm-dashboard'

  return (
    <div style={{ padding: '0 16px', marginBottom: '8px' }}>
      <Link
        href="/admin/crm-dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: isActive ? 500 : 400,
          background: isActive ? 'rgba(0,0,0,0.08)' : 'transparent',
          color: 'inherit',
        }}
      >
        📊 CRM Dashboard
      </Link>
    </div>
  )
}
