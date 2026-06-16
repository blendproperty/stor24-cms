'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const DashboardNav = () => {
  const pathname = usePathname()

  const links = [
    { href: '/admin/crm-dashboard',             label: '📊 CRM Dashboard' },
    { href: '/admin/crm-dashboard/performance', label: '📈 Performance' },
  ]

  return (
    <div style={{ padding: '0 16px', marginBottom: '8px' }}>
      {links.map(({ href, label }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
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
              marginBottom: '2px',
            }}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
