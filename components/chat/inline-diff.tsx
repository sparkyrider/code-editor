'use client'

import { useState, useMemo } from 'react'
import { Icon } from '@iconify/react'
import type { EditProposal } from '@/lib/edit-parser'

interface Props {
  proposal: EditProposal
  original?: string
  onApply: (proposal: EditProposal) => void
  onReject?: () => void
}

interface DiffLine {
  type: 'add' | 'del' | 'ctx'
  content: string
  oldNum?: number
  newNum?: number
}

/**
 * Compute a simple unified diff between two strings.
 * Uses a basic LCS-based line diff — no external deps.
 */
function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const lines: DiffLine[] = []

  // Simple diff: find common prefix, suffix, then show changes
  let prefixLen = 0
  while (prefixLen < oldLines.length && prefixLen < newLines.length && oldLines[prefixLen] === newLines[prefixLen]) {
    prefixLen++
  }

  let suffixLen = 0
  while (
    suffixLen < oldLines.length - prefixLen &&
    suffixLen < newLines.length - prefixLen &&
    oldLines[oldLines.length - 1 - suffixLen] === newLines[newLines.length - 1 - suffixLen]
  ) {
    suffixLen++
  }

  // Context lines before changes (show up to 3)
  const ctxStart = Math.max(0, prefixLen - 3)
  for (let i = ctxStart; i < prefixLen; i++) {
    lines.push({ type: 'ctx', content: oldLines[i], oldNum: i + 1, newNum: i + 1 })
  }

  // Deleted lines
  const oldEnd = oldLines.length - suffixLen
  for (let i = prefixLen; i < oldEnd; i++) {
    lines.push({ type: 'del', content: oldLines[i], oldNum: i + 1 })
  }

  // Added lines
  const newEnd = newLines.length - suffixLen
  for (let i = prefixLen; i < newEnd; i++) {
    lines.push({ type: 'add', content: newLines[i], newNum: i + 1 })
  }

  // Context lines after changes (show up to 3)
  const ctxEnd = Math.min(oldLines.length, oldEnd + 3)
  for (let i = oldEnd; i < ctxEnd; i++) {
    const newIdx = i - oldEnd + newEnd
    lines.push({ type: 'ctx', content: oldLines[i], oldNum: i + 1, newNum: newIdx + 1 })
  }

  return lines
}

/**
 * Inline unified diff viewer — renders directly in chat message.
 * Codex-inspired: line numbers, gutter signs, approve/reject buttons.
 */
export function InlineDiff({ proposal, original, onApply, onReject }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const fileName = proposal.filePath.split('/').pop() || proposal.filePath
  const isNewFile = !original

  const diffLines = useMemo(() => {
    if (isNewFile) {
      return proposal.content.split('\n').map((line, i): DiffLine => ({
        type: 'add', content: line, newNum: i + 1,
      }))
    }
    return computeDiff(original, proposal.content)
  }, [original, proposal.content, isNewFile])

  const additions = diffLines.filter(l => l.type === 'add').length
  const deletions = diffLines.filter(l => l.type === 'del').length

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden my-1.5">
      {/* File header */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] border-b border-[var(--border)]">
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
          <Icon icon={collapsed ? 'lucide:chevron-right' : 'lucide:chevron-down'} width={12} className="text-[var(--text-disabled)] shrink-0" />
          <Icon icon="lucide:file-diff" width={12} className="text-[var(--text-tertiary)] shrink-0" />
          <span className="text-[11px] font-mono text-[var(--text-primary)] truncate">{proposal.filePath}</span>
          {isNewFile && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,#34d399_15%,transparent)] text-[color-mix(in_srgb,#34d399_80%,var(--brand))] font-medium">NEW</span>
          )}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {additions > 0 && <span className="text-[10px] font-mono text-[color-mix(in_srgb,#34d399_80%,var(--brand))]">+{additions}</span>}
          {deletions > 0 && <span className="text-[10px] font-mono text-red-400">-{deletions}</span>}
          <button
            onClick={() => onApply(proposal)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer
              bg-[color-mix(in_srgb,#34d399_12%,transparent)] text-[color-mix(in_srgb,#34d399_80%,var(--brand))]
              hover:bg-[color-mix(in_srgb,#34d399_20%,transparent)]
              border border-[color-mix(in_srgb,#34d399_25%,transparent)]"
          >
            <Icon icon="lucide:check" width={10} />
            Apply
          </button>
          {onReject && (
            <button
              onClick={onReject}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer
                text-[var(--text-disabled)] hover:text-red-400
                hover:bg-[color-mix(in_srgb,red_8%,transparent)]"
            >
              <Icon icon="lucide:x" width={10} />
            </button>
          )}
        </div>
      </div>

      {/* Diff content */}
      {!collapsed && (
        <div className="overflow-x-auto max-h-64 overflow-y-auto text-[11px] font-mono leading-[18px]">
          {diffLines.length === 0 ? (
            <div className="px-3 py-2 text-[var(--text-disabled)] text-[10px]">No changes</div>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {diffLines.map((line, i) => (
                  <tr
                    key={i}
                    className={
                      line.type === 'add'
                        ? 'bg-[color-mix(in_srgb,#34d399_6%,transparent)]'
                        : line.type === 'del'
                        ? 'bg-[color-mix(in_srgb,red_6%,transparent)]'
                        : ''
                    }
                  >
                    {/* Old line number */}
                    <td className="w-8 text-right pr-1 select-none text-[9px] text-[var(--text-disabled)] align-top">
                      {line.type !== 'add' ? line.oldNum : ''}
                    </td>
                    {/* New line number */}
                    <td className="w-8 text-right pr-1 select-none text-[9px] text-[var(--text-disabled)] align-top">
                      {line.type !== 'del' ? line.newNum : ''}
                    </td>
                    {/* Gutter sign */}
                    <td className={`w-4 text-center select-none align-top ${
                      line.type === 'add' ? 'text-[color-mix(in_srgb,#34d399_80%,var(--brand))]' :
                      line.type === 'del' ? 'text-red-400' : 'text-[var(--text-disabled)]'
                    }`}>
                      {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                    </td>
                    {/* Content */}
                    <td className={`pl-1 pr-3 whitespace-pre ${
                      line.type === 'add' ? 'text-[color-mix(in_srgb,#34d399_90%,var(--text-primary))]' :
                      line.type === 'del' ? 'text-red-300' : 'text-[var(--text-secondary)]'
                    }`}>
                      {line.content || '\u00A0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Batch diff view for multiple edit proposals.
 */
export function InlineDiffGroup({
  proposals,
  getOriginal,
  onApply,
  onApplyAll,
}: {
  proposals: EditProposal[]
  getOriginal: (filePath: string) => string | undefined
  onApply: (proposal: EditProposal) => void
  onApplyAll: () => void
}) {
  if (proposals.length === 0) return null

  return (
    <div className="space-y-1">
      {proposals.map((proposal, i) => (
        <InlineDiff
          key={`${proposal.filePath}-${i}`}
          proposal={proposal}
          original={getOriginal(proposal.filePath)}
          onApply={onApply}
        />
      ))}
      {proposals.length > 1 && (
        <button
          onClick={onApplyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer w-full justify-center
            bg-[color-mix(in_srgb,#34d399_10%,transparent)] text-[color-mix(in_srgb,#34d399_80%,var(--brand))]
            hover:bg-[color-mix(in_srgb,#34d399_18%,transparent)]
            border border-[color-mix(in_srgb,#34d399_20%,transparent)]"
        >
          <Icon icon="lucide:check-check" width={13} />
          Apply all {proposals.length} files
        </button>
      )}
    </div>
  )
}
