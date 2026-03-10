'use client'

import { useMemo } from 'react'
import { KnotLogo } from '@/components/knot-logo'

const GRID_SIZE = 64
const LOGO_COUNT = 18

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

export function KnotBackground() {
  const logos = useMemo(() => {
    const rng = seededRandom(42)
    return Array.from({ length: LOGO_COUNT }, (_, i) => ({
      id: i,
      x: rng() * 100,
      y: rng() * 100,
      size: 16 + rng() * 20,
      rotation: rng() * 360,
      opacity: 0.025 + rng() * 0.035,
    }))
  }, [])

  return (
    <div className="knot-bg-root" aria-hidden="true">
      {/* Grid lines */}
      <div
        className="knot-bg-grid"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--text-primary) 4%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,0,0,0.5), transparent)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(0,0,0,0.5), transparent)',
        }}
      />

      {/* Scattered logos */}
      <div className="knot-bg-logos">
        {logos.map((l) => (
          <div
            key={l.id}
            className="absolute"
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              opacity: l.opacity,
              transform: `rotate(${l.rotation}deg)`,
            }}
          >
            <KnotLogo size={l.size} color="var(--text-primary)" />
          </div>
        ))}
      </div>

      {/* Subtle center glow */}
      <div className="knot-bg-glow" />
    </div>
  )
}
