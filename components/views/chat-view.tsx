'use client'

import dynamic from 'next/dynamic'

const AgentPanel = dynamic(() => import('@/components/agent-panel').then(m => ({ default: m.AgentPanel })), { ssr: false })

export function ChatView() {
  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-[var(--bg)]">
      <AgentPanel />
    </div>
  )
}
