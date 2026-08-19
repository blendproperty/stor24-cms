'use client'
import React from 'react'

export const Logo = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: '#ff5a0a',
          color: '#f5f3ea',
          fontWeight: 800,
          fontSize: '14px',
        }}
      >
        S
      </span>
      <span style={{ fontSize: '20px', fontWeight: 800, color: '#071411', letterSpacing: '-0.01em' }}>
        Stor24
      </span>
      <span style={{ fontSize: '13px', fontWeight: 500, color: '#0b1d19', opacity: 0.55 }}>CMS</span>
    </div>
  )
}

export default Logo
