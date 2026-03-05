'use client'

import { useId, useMemo } from 'react'

export function KnotBackground() {
  const uid = useId()
  const pid = useMemo(() => uid.replace(/:/g, ''), [uid])

  return (
    <div className="knot-bg-root" aria-hidden="true">
      {/* Technical dot grid */}
      <svg className="knot-bg-grid" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id={`dotgrid${pid}`} width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="0.6" fill="var(--text-disabled)" opacity="0.3" />
          </pattern>
          <pattern id={`crossgrid${pid}`} width="128" height="128" patternUnits="userSpaceOnUse">
            <line
              x1="64"
              y1="60"
              x2="64"
              y2="68"
              stroke="var(--text-disabled)"
              strokeWidth="0.5"
              opacity="0.15"
            />
            <line
              x1="60"
              y1="64"
              x2="68"
              y2="64"
              stroke="var(--text-disabled)"
              strokeWidth="0.5"
              opacity="0.15"
            />
          </pattern>
          <radialGradient id={`gridmask${pid}`} cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id={`gm${pid}`}>
            <rect width="100%" height="100%" fill={`url(#gridmask${pid})`} />
          </mask>
        </defs>
        <g mask={`url(#gm${pid})`}>
          <rect width="100%" height="100%" fill={`url(#dotgrid${pid})`} />
          <rect width="100%" height="100%" fill={`url(#crossgrid${pid})`} />
        </g>
      </svg>

      {/* Ambient glow */}
      <div className="knot-bg-glow" />
    </div>
  )
}
