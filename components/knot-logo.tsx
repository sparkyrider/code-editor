'use client'

import Image from 'next/image'

interface KnotLogoProps {
  size?: number
  className?: string
}

export function KnotLogo({ size = 24, className }: KnotLogoProps) {
  return (
    <Image
      src="/favicon.png"
      alt="Knot Code"
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  )
}
