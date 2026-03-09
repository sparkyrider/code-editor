'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import {
  type AgentActivity,
  activityIcon,
  activityColor,
  formatDuration,
  summarizeActivities,
} from '@/lib/agent-activity'

interface Props {
  activities: AgentActivity[]
  isRunning: boolean
  elapsedMs?: number
}

/**
 * Codex-inspired activity feed — collapsible summary bar + expandable timeline.
 * Exec commands render as discrete cards with command text, output, and exit code.
 */
export function AgentActivityFeed({ activities, isRunning, elapsedMs }: Props) {
  const [expanded, setExpanded] = useState(false)
  const summary = summarizeActivities(activities)

  if (activities.length === 0 && !isRunning) return null

  const lastActivity = activities[activities.length - 1]

  return (
    <div className="mx-2 mb-2">
      {/* Summary bar — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer
          bg-[color-mix(in_srgb,var(--bg-elevated)_80%,transparent)]
          border border-[var(--border)]
          hover:bg-[color-mix(in_srgb,var(--text-primary)_4%,transparent)]"
      >
        {/* Status indicator */}
        {isRunning ? (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--brand)]" />
          </span>
        ) : (
          <Icon icon="lucide:check-circle-2" width={12} className="text-[color-mix(in_srgb,#34d399_80%,var(--brand))] shrink-0" />
        )}

        {/* Current action or summary */}
        <span className="text-[var(--text-secondary)] truncate flex-1 text-left">
          {isRunning && lastActivity
            ? lastActivity.label
            : `${summary.totalActions} action${summary.totalActions !== 1 ? 's' : ''} completed`}
        </span>

        {/* Badges */}
        <span className="flex items-center gap-1.5 shrink-0">
          {summary.filesEdited.length > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,#fbbf24_10%,transparent)] text-[color-mix(in_srgb,#fbbf24_80%,var(--brand))]">
              <Icon icon="lucide:file-pen-line" width={9} />
              {summary.filesEdited.length}
            </span>
          )}
          {summary.filesCreated.length > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,#34d399_10%,transparent)] text-[color-mix(in_srgb,#34d399_80%,var(--brand))]">
              <Icon icon="lucide:file-plus" width={9} />
              {summary.filesCreated.length}
            </span>
          )}
          {summary.commandsRun > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,#22d3ee_10%,transparent)] text-[color-mix(in_srgb,#22d3ee_80%,var(--brand))]">
              <Icon icon="lucide:terminal" width={9} />
              {summary.commandsRun}
            </span>
          )}
          {/* Elapsed time */}
          {elapsedMs != null && elapsedMs > 0 && (
            <span className="text-[10px] text-[var(--text-disabled)] tabular-nums">
              {formatDuration(elapsedMs)}
            </span>
          )}
        </span>

        <Icon icon={expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'} width={12} className="text-[var(--text-disabled)] shrink-0" />
      </button>

      {/* Expanded timeline */}
      {expanded && (
        <div className="mt-1 rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_90%,transparent)] overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {activities.map((activity, idx) => (
              <ActivityItem key={activity.id} activity={activity} isLast={idx === activities.length - 1 && isRunning} />
            ))}
          </div>

          {/* Changed files summary */}
          {!isRunning && (summary.filesEdited.length > 0 || summary.filesCreated.length > 0) && (
            <div className="border-t border-[var(--border)] px-3 py-2">
              <div className="text-[10px] font-medium text-[var(--text-disabled)] uppercase tracking-wider mb-1">Changed Files</div>
              <div className="flex flex-wrap gap-1">
                {[...summary.filesEdited, ...summary.filesCreated].map(f => (
                  <span key={f} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] text-[10px] text-[var(--text-secondary)] font-mono">
                    {summary.filesCreated.includes(f) ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[color-mix(in_srgb,#34d399_80%,var(--brand))]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[color-mix(in_srgb,#fbbf24_80%,var(--brand))]" />
                    )}
                    {f.split('/').pop()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Single activity item — exec commands get a card treatment */
function ActivityItem({ activity, isLast }: { activity: AgentActivity; isLast: boolean }) {
  const [outputExpanded, setOutputExpanded] = useState(false)
  const isCommand = activity.type === 'command'
  const color = activityColor(activity.type)

  return (
    <div className="flex gap-2 px-3 py-1.5 relative">
      {/* Timeline dot */}
      <div className="flex flex-col items-center shrink-0 pt-0.5">
        <div
          className="w-3 h-3 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
        >
          {isLast && activity.status === 'running' ? (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
          ) : (
            <Icon icon={activityIcon(activity.type)} width={8} style={{ color }} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isCommand ? (
          /* Exec command card */
          <div className="rounded-md border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_95%,transparent)] overflow-hidden">
            {/* Command header */}
            <div className="flex items-center gap-2 px-2 py-1 bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)]">
              <Icon icon="lucide:terminal" width={10} style={{ color }} />
              <code className="text-[10px] text-[var(--text-primary)] font-mono truncate flex-1">{activity.label}</code>
              <span className="flex items-center gap-1.5 shrink-0">
                {activity.durationMs != null && (
                  <span className="text-[9px] text-[var(--text-disabled)] tabular-nums">{formatDuration(activity.durationMs)}</span>
                )}
                {activity.status === 'running' ? (
                  <span className="text-[9px] text-[var(--brand)] animate-pulse">running</span>
                ) : activity.exitCode === 0 || activity.exitCode === undefined ? (
                  <Icon icon="lucide:check" width={10} className="text-[color-mix(in_srgb,#34d399_80%,var(--brand))]" />
                ) : (
                  <span className="text-[9px] text-red-400 font-mono">exit {activity.exitCode}</span>
                )}
              </span>
            </div>
            {/* Output preview */}
            {activity.output && (
              <button
                onClick={() => setOutputExpanded(!outputExpanded)}
                className="w-full text-left px-2 py-1 border-t border-[var(--border)] cursor-pointer hover:bg-[color-mix(in_srgb,var(--text-primary)_2%,transparent)]"
              >
                <pre className={`text-[9px] text-[var(--text-tertiary)] font-mono whitespace-pre-wrap ${outputExpanded ? '' : 'line-clamp-3'}`}>
                  {activity.output}
                </pre>
                {!outputExpanded && activity.output.split('\n').length > 3 && (
                  <span className="text-[9px] text-[var(--text-disabled)]">click to expand…</span>
                )}
              </button>
            )}
          </div>
        ) : (
          /* Standard activity row */
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[var(--text-secondary)] truncate">{activity.label}</span>
            {activity.durationMs != null && (
              <span className="text-[9px] text-[var(--text-disabled)] tabular-nums shrink-0">{formatDuration(activity.durationMs)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
