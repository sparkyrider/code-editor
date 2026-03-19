'use client'

import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { useThread } from '@/context/thread-context'
import { useAgentTrace } from '@/context/agent-trace-context'
import { CODE_EDITOR_SESSION_KEY } from '@/lib/agent-session'
import { activityColor, activityIcon, formatDuration } from '@/lib/agent-activity'
import { makeRunPreview, summarizeRunSteps } from '@/lib/agent-trace'

function formatAge(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function AgentsView() {
  const { activeThreadId } = useThread()
  const { getRunsForSession } = useAgentTrace()
  const sessionKey = `${CODE_EDITOR_SESSION_KEY}:${activeThreadId}`
  const runs = getRunsForSession(sessionKey)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)

  const selectedRun = useMemo(() => {
    if (selectedRunId) return runs.find((run) => run.id === selectedRunId) ?? runs[0] ?? null
    return runs[0] ?? null
  }, [runs, selectedRunId])

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[var(--bg)]">
      <div className="flex w-[320px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] text-[var(--brand)]">
              <Icon icon="lucide:bot" width={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Agents</h2>
              <p className="mt-0.5 text-[12px] text-[var(--text-secondary)]">
                Current-session runs only — no historical agents mixed in.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {runs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-4 py-5 text-sm text-[var(--text-secondary)]">
              Start an agent run in this thread to populate the review panel.
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => {
                const active = selectedRun?.id === run.id
                return (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-all cursor-pointer ${
                      active
                        ? 'border-[color-mix(in_srgb,var(--brand)_35%,var(--border))] bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] shadow-[var(--shadow-xs)]'
                        : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--border-hover)] hover:bg-[color-mix(in_srgb,var(--text-primary)_4%,transparent)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex h-2.5 w-2.5 rounded-full ${
                          run.status === 'running'
                            ? 'bg-[var(--warning)]'
                            : run.status === 'done'
                              ? 'bg-[var(--success)]'
                              : 'bg-[var(--color-deletions,#ef4444)]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium text-[var(--text-primary)]">
                          {makeRunPreview(run.prompt)}
                        </div>
                        <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                          {run.latestStatus || summarizeRunSteps(run.steps)}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[var(--text-disabled)]">
                          <span>{run.provider}</span>
                          <span>•</span>
                          <span>{formatAge(run.startedAt)}</span>
                          <span>•</span>
                          <span>{run.steps.length} steps</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-[var(--border)] px-5 py-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {selectedRun ? 'Run Trace' : 'Trace Preview'}
          </h3>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            Standardized step timeline for consistent agent progress rendering.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {!selectedRun ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-6 text-sm text-[var(--text-secondary)]">
              No agent run selected yet.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-semibold text-[var(--text-primary)]">
                      {makeRunPreview(selectedRun.prompt)}
                    </div>
                    <div className="mt-1 text-[12px] text-[var(--text-secondary)]">
                      Latest status: {selectedRun.latestStatus}
                    </div>
                  </div>
                  <div className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                    {selectedRun.status}
                  </div>
                </div>
              </div>

              {selectedRun.steps.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-5 text-sm text-[var(--text-secondary)]">
                  Waiting for structured tool or status events…
                </div>
              ) : (
                selectedRun.steps.map((step) => (
                  <div
                    key={step.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${activityColor(step.type === 'message' ? 'think' : step.type)} 14%, transparent)`,
                        }}
                      >
                        <Icon
                          icon={activityIcon(step.type === 'message' ? 'think' : step.type)}
                          width={15}
                          style={{
                            color: activityColor(step.type === 'message' ? 'think' : step.type),
                          }}
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[13px] font-medium text-[var(--text-primary)]">
                            {step.title}
                          </span>
                          <span className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--text-secondary)]">
                            {step.status}
                          </span>
                          <span className="text-[10px] text-[var(--text-disabled)]">
                            {formatAge(step.timestamp)}
                          </span>
                          {step.durationMs != null && (
                            <span className="text-[10px] text-[var(--text-disabled)]">
                              {formatDuration(step.durationMs)}
                            </span>
                          )}
                        </div>
                        {step.command && (
                          <pre className="mt-2 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[11px] text-[var(--text-primary)]">
                            {step.command}
                          </pre>
                        )}
                        {step.output && (
                          <pre className="mt-2 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[11px] text-[var(--text-secondary)]">
                            {step.output}
                          </pre>
                        )}
                        {step.file && !step.command && (
                          <div className="mt-2 text-[11px] text-[var(--text-secondary)]">
                            {step.file}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
