'use client'

import { McpLibrary } from '@/components/mcp-library'

export function McpLibraryView() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--bg)]">
      <McpLibrary />
    </div>
  )
}
