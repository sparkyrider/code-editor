'use client'

import { PromptLibrary } from '@/components/prompts/prompt-library'

export function PromptLibraryView() {
  return (
    <div className="flex h-full w-full overflow-y-auto bg-[var(--sidebar-bg)]">
      <div className="mx-auto w-full max-w-[1680px]">
        <PromptLibrary variant="page" />
      </div>
    </div>
  )
}
