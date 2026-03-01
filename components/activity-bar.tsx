'use client'

import { Icon } from '@iconify/react'

interface ActivityBarProps {
  active: string
  onSelect: (id: string) => void
  explorerVisible: boolean
  agentOpen: boolean
  terminalVisible: boolean
  engineVisible: boolean
  dirtyCount: number
  gatewayConnected: boolean
}

const items = [
  { id: 'explorer', icon: 'lucide:files', label: 'Explorer (⌘B)' },
  { id: 'search', icon: 'lucide:search', label: 'Search (⌘⇧F)' },
  { id: 'changes', icon: 'lucide:git-branch', label: 'Source Control' },
  { id: 'agent', icon: 'lucide:bot', label: 'Agent (⌘J)' },
] as const

const bottomItems = [
  { id: 'terminal', icon: 'lucide:terminal', label: 'Terminal (⌘`)' },
  { id: 'engine', icon: 'lucide:cpu', label: 'Engine (⌘⇧E)' },
  { id: 'settings', icon: 'lucide:settings', label: 'Settings' },
] as const

export function ActivityBar({
  active,
  onSelect,
  explorerVisible,
  agentOpen,
  terminalVisible,
  engineVisible,
  dirtyCount,
  gatewayConnected,
}: ActivityBarProps) {
  const isActive = (id: string) => {
    if (id === 'explorer') return explorerVisible
    if (id === 'agent') return agentOpen
    if (id === 'terminal') return terminalVisible
    if (id === 'engine') return engineVisible
    return active === id
  }

  return (
    <div className="flex flex-col items-center justify-between w-[42px] shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border)] py-1.5">
      <div className="flex flex-col items-center gap-0.5">
        {items.map(item => {
          const act = isActive(item.id)
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={item.label}
              className={`relative flex items-center justify-center w-[34px] h-[34px] rounded-lg transition-all duration-150 cursor-pointer ${
                act
                  ? 'text-[var(--text-primary)] bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {/* Active indicator bar */}
              {act && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full bg-[var(--brand)]" />
              )}
              <Icon icon={item.icon} width={18} height={18} />
              {/* Badge for source control */}
              {item.id === 'changes' && dirtyCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-[var(--brand)] text-[8px] font-bold text-white flex items-center justify-center px-0.5">
                  {dirtyCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-0.5">
        {bottomItems.map(item => {
          const act = isActive(item.id)
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              title={item.label}
              className={`relative flex items-center justify-center w-[34px] h-[34px] rounded-lg transition-all duration-150 cursor-pointer ${
                act
                  ? 'text-[var(--text-primary)] bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              {item.id === 'engine' && (
                <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                  gatewayConnected ? 'bg-[var(--color-additions)]' : 'bg-[var(--text-disabled)]'
                }`} />
              )}
              <Icon icon={item.icon} width={18} height={18} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
