/**
 * Agent Activity Log — structured tracking of agent actions during execution.
 * Inspired by Codex exec cells: shows commands, output, timing, and file diffs.
 */

export type ActivityType = 'read' | 'edit' | 'search' | 'command' | 'think' | 'write' | 'create'

export interface AgentActivity {
  id: string
  type: ActivityType
  label: string
  file?: string
  detail?: string
  /** For commands: the raw command text */
  command?: string
  /** For commands: truncated stdout/stderr */
  output?: string
  /** For commands: exit code (0 = success) */
  exitCode?: number
  /** Duration in milliseconds */
  durationMs?: number
  timestamp: number
  status: 'running' | 'done' | 'error'
}

export interface AgentActivitySummary {
  filesRead: string[]
  filesEdited: string[]
  filesCreated: string[]
  commandsRun: number
  searchesPerformed: number
  totalActions: number
}

/**
 * Parse a tool_use event into an AgentActivity.
 */
export function parseToolActivity(
  toolName: string,
  input?: Record<string, unknown>,
): AgentActivity {
  const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`
  const timestamp = Date.now()

  const path = (input?.path || input?.file_path || input?.file || '') as string
  const fileName = path ? path.split('/').pop() || path : ''

  if (toolName === 'read' || toolName === 'Read') {
    return {
      id, type: 'read', label: `Read ${fileName || 'file'}`,
      file: path || undefined, timestamp, status: 'done',
    }
  }

  if (toolName === 'write' || toolName === 'Write') {
    const isNew = !input?.old_string && !input?.oldText
    return {
      id, type: isNew ? 'create' : 'write',
      label: isNew ? `Create ${fileName}` : `Write ${fileName}`,
      file: path || undefined, timestamp, status: 'done',
    }
  }

  if (toolName === 'edit' || toolName === 'Edit') {
    return {
      id, type: 'edit', label: `Edit ${fileName || 'file'}`,
      file: path || undefined, timestamp, status: 'done',
    }
  }

  if (toolName.includes('search') || toolName === 'Grep' || toolName === 'grep') {
    const query = (input?.query || input?.pattern || '') as string
    return {
      id, type: 'search',
      label: `Search ${query ? `"${query.slice(0, 30)}"` : 'files'}`,
      detail: query, timestamp, status: 'done',
    }
  }

  if (toolName.includes('exec') || toolName === 'Bash' || toolName === 'bash') {
    const cmd = (input?.command || '') as string
    const firstLine = cmd.split('\n')[0].slice(0, 60)
    return {
      id, type: 'command',
      label: cmd ? firstLine : 'Run command',
      command: cmd,
      detail: cmd,
      timestamp, status: 'running',
    }
  }

  return {
    id, type: 'think', label: toolName,
    timestamp, status: 'done',
  }
}

/**
 * Update a command activity with its result.
 */
export function completeCommandActivity(
  activity: AgentActivity,
  output?: string,
  exitCode?: number,
): AgentActivity {
  return {
    ...activity,
    output: output ? output.slice(0, 500) : undefined,
    exitCode,
    durationMs: Date.now() - activity.timestamp,
    status: exitCode === 0 || exitCode === undefined ? 'done' : 'error',
  }
}

/**
 * Format a duration in ms to a human-readable string.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins}m ${secs}s`
}

/**
 * Summarize activities into a file-change overview.
 */
export function summarizeActivities(activities: AgentActivity[]): AgentActivitySummary {
  const filesRead = new Set<string>()
  const filesEdited = new Set<string>()
  const filesCreated = new Set<string>()
  let commandsRun = 0
  let searchesPerformed = 0

  for (const a of activities) {
    if (a.file) {
      if (a.type === 'read') filesRead.add(a.file)
      if (a.type === 'edit' || a.type === 'write') filesEdited.add(a.file)
      if (a.type === 'create') filesCreated.add(a.file)
    }
    if (a.type === 'command') commandsRun++
    if (a.type === 'search') searchesPerformed++
  }

  return {
    filesRead: [...filesRead],
    filesEdited: [...filesEdited],
    filesCreated: [...filesCreated],
    commandsRun,
    searchesPerformed,
    totalActions: activities.length,
  }
}

/**
 * Icon for an activity type.
 */
export function activityIcon(type: ActivityType): string {
  switch (type) {
    case 'read': return 'lucide:file-search'
    case 'edit': return 'lucide:file-pen-line'
    case 'write': return 'lucide:file-pen-line'
    case 'create': return 'lucide:file-plus'
    case 'search': return 'lucide:search'
    case 'command': return 'lucide:terminal'
    case 'think': return 'lucide:brain'
  }
}

/**
 * Color for an activity type using CSS custom properties.
 */
export function activityColor(type: ActivityType): string {
  switch (type) {
    case 'read': return 'color-mix(in srgb, #60a5fa 80%, var(--brand))'
    case 'edit': return 'color-mix(in srgb, #fbbf24 80%, var(--brand))'
    case 'write': return 'color-mix(in srgb, #fbbf24 80%, var(--brand))'
    case 'create': return 'color-mix(in srgb, #34d399 80%, var(--brand))'
    case 'search': return 'color-mix(in srgb, #a78bfa 80%, var(--brand))'
    case 'command': return 'color-mix(in srgb, #22d3ee 80%, var(--brand))'
    case 'think': return 'var(--text-disabled)'
  }
}
