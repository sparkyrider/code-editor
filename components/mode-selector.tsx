'use client'

import { useRef, useLayoutEffect, useEffect, useState, useCallback } from 'react'
import { Icon } from '@iconify/react'

export type AgentMode = 'ask' | 'agent' | 'plan'

const MODES: Array<{ id: AgentMode; label: string; icon: string; desc: string }> = [
  {
    id: 'ask',
    label: 'Ask',
    icon: 'lucide:message-square',
    desc: 'Discuss and answer questions — no code changes',
  },
  {
    id: 'agent',
    label: 'Agent',
    icon: 'lucide:zap',
    desc: 'Autonomous code changes and edits',
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'lucide:list-checks',
    desc: 'Outline steps first, then execute with approval',
  },
]

interface Props {
  mode: AgentMode
  onChange: (mode: AgentMode) => void
  size?: 'sm' | 'md'
}

export function ModeSelector({ mode, onChange, size = 'sm' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState({ left: 0, width: 0 })

  const recalcPill = useCallback(() => {
    const idx = MODES.findIndex((m) => m.id === mode)
    const btn = btnRefs.current[idx]
    const container = containerRef.current
    if (btn && container) {
      const cRect = container.getBoundingClientRect()
      const bRect = btn.getBoundingClientRect()
      if (bRect.width > 0) {
        setPill({ left: bRect.left - cRect.left, width: bRect.width })
      }
    }
  }, [mode])

  useLayoutEffect(recalcPill, [recalcPill])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(recalcPill)
    ro.observe(container)
    for (const btn of btnRefs.current) {
      if (btn) ro.observe(btn)
    }
    return () => ro.disconnect()
  }, [recalcPill])

  const isMd = size === 'md'

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center rounded-[12px] border border-[color-mix(in_srgb,var(--border)_92%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_92%,transparent)] shadow-[var(--shadow-xs)] ${
        isMd ? 'gap-0.5 p-[4px]' : 'gap-[2px] p-[3px]'
      }`}
    >
      <span
        className={`absolute rounded-[10px] pointer-events-none bg-[color-mix(in_srgb,var(--text-primary)_10%,var(--bg))] ${
          isMd
            ? 'top-[4px] h-[calc(100%-8px)] shadow-[0_2px_6px_rgba(0,0,0,0.16),0_0_0_1px_color-mix(in_srgb,var(--brand)_18%,transparent)]'
            : 'top-[3px] h-[calc(100%-6px)] shadow-[0_2px_5px_rgba(0,0,0,0.14),0_0_0_1px_color-mix(in_srgb,var(--brand)_14%,transparent)]'
        }`}
        style={{
          left: pill.left,
          width: pill.width,
          transition:
            'left 300ms cubic-bezier(0.22, 1, 0.36, 1), width 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          opacity: pill.width > 0 ? 1 : 0,
        }}
      />
      {MODES.map((m, i) => (
        <button
          key={m.id}
          ref={(el) => {
            btnRefs.current[i] = el
          }}
          onClick={() => onChange(m.id)}
          className={`relative z-[1] flex items-center rounded-[10px] font-medium transition-colors duration-200 cursor-pointer select-none ${
            isMd ? 'gap-1.5 px-3.5 py-2 text-[13px]' : 'gap-1.5 px-3 py-1.5 text-[12px]'
          } ${
            mode === m.id
              ? 'text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          title={m.desc}
        >
          <Icon icon={m.icon} width={isMd ? 15 : 13} height={isMd ? 15 : 13} />
          {m.label}
        </button>
      ))}
    </div>
  )
}
