import React from 'react'

// Nonces must be generated while rendering the current request, never at build time.
export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
