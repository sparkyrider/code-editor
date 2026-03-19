import type { AgentActivity } from '@/lib/agent-activity'

export type AgentRunStatus = 'running' | 'done' | 'error' | 'cancelled'

export interface AgentTraceStep {
  id: string
  runId: string
  sessionKey: string
  timestamp: number
  type: AgentActivity['type'] | 'message'
  title: string
  status: 'running' | 'done' | 'error'
  file?: string
  command?: string
  output?: string
  durationMs?: number
  detail?: string
  exitCode?: number
}

export interface AgentRunRecord {
  id: string
  sessionKey: string
  prompt: string
  provider: 'gateway'
  status: AgentRunStatus
  startedAt: number
  updatedAt: number
  completedAt?: number
  latestStatus: string
  steps: AgentTraceStep[]
}

export function makeRunPreview(prompt: string): string {
  const compact = prompt.replace(/\s+/g, ' ').trim()
  return compact.length > 120 ? `${compact.slice(0, 117)}…` : compact
}

export function summarizeRunSteps(steps: AgentTraceStep[]): string {
  if (steps.length === 0) return 'Waiting for agent activity…'
  const last = steps[steps.length - 1]
  return last.title
}
