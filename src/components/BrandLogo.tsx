import Image from 'next/image'

// The supplied outlined artwork is indivisible. Never rebuild it with type or CSS.
export function BrandLogo({ className = '' }: { className?: string }) {
  return <Image className={`s24-brand-logo ${className}`} src="/brand/stor24-logo-official.svg" alt="STOR24" width={611} height={160} priority />
}
