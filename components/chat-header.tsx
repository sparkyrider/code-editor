'use client'

import { Icon } from '@iconify/react'
import { useRepo } from '@/context/repo-context'
import { useLocal } from '@/context/local-context'

interface Props {
  title?: string
  messageCount: number
  isStreaming?: boolean
  modelName?: string
  contextTokens?: number
  maxContextTokens?: number
}

export function ChatHeader({
  title,
  messageCount,
  isStreaming,
  modelName,
  contextTokens = 0,
  maxContextTokens = 128000,
}: Props) {
  const { repo } = useRepo()
  const local = useLocal()

  const repoName = repo?.fullName ?? local.rootPath?.split('/').pop() ?? null
  const branchName = repo?.branch ?? local.gitInfo?.branch ?? null
  const contextPct =
    maxContextTokens > 0 ? Math.min((contextTokens / maxContextTokens) * 100, 100) : 0

  if (!title && messageCount === 0) return null

  return (
    <div className="shrink-0">
      <div className="flex items-center justify-between h-11 px-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Streaming status indicator */}
          {isStreaming ? (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--brand)]" />
            </span>
          ) : (
            <Icon
              icon="lucide:message-square"
              width={14}
              height={14}
              className="text-[var(--text-tertiary)] shrink-0"
            />
          )}
          <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
            {title || 'Chat'}
          </span>
          {repoName && (
            <>
              <span className="text-[var(--text-disabled)]">&middot;</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Icon
                  icon="lucide:git-branch"
                  width={12}
                  height={12}
                  className="text-[var(--text-disabled)]"
                />
                <span className="text-[12px] font-mono text-[var(--text-tertiary)]">
                  {repoName}
                </span>
                {branchName && (
                  <span className="text-[11px] font-mono text-[var(--text-disabled)]">
                    /{branchName}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Model badge */}
          {modelName && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] border border-[color-mix(in_srgb,var(--brand)_15%,transparent)] text-[var(--text-tertiary)]">
              <Icon icon="lucide:sparkles" width={9} height={9} className="text-[var(--brand)]" />
              {modelName
                .replace(/^.*\//, '')
                .replace(/(claude-|gpt-)/, '')
                .slice(0, 16)}
            </span>
          )}
          <span className="text-[11px] text-[var(--text-disabled)]">{messageCount} messages</span>
        </div>
      </div>

      {/* Context usage bar */}
      {contextPct > 0 && (
        <div className="context-usage-bar">
          <div
            className={`context-usage-bar-fill ${contextPct > 80 ? '!bg-[var(--warning)]' : contextPct > 95 ? '!bg-[var(--error)]' : ''}`}
            style={{ width: `${contextPct}%` }}
          />
        </div>
      )}
    </div>
  )
}
