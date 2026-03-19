'use client'

import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { on } from '@/lib/events'
import { useEffect } from 'react'
import type { AgentRunRecord, AgentTraceStep, AgentRunStatus } from '@/lib/agent-trace'

type TraceState = Record<string, AgentRunRecord[]>

type TraceAction =
  | {
      type: 'start'
      payload: {
        runId: string
        sessionKey: string
        prompt: string
        provider: 'gateway'
        timestamp: number
      }
    }
  | { type: 'step'; payload: AgentTraceStep }
  | {
      type: 'finish'
      payload: {
        runId: string
        sessionKey: string
        status: AgentRunStatus
        latestStatus: string
        timestamp: number
      }
    }

function reducer(state: TraceState, action: TraceAction): TraceState {
  switch (action.type) {
    case 'start': {
      const { runId, sessionKey, prompt, provider, timestamp } = action.payload
      const existing = state[sessionKey] ?? []
      const nextRun: AgentRunRecord = {
        id: runId,
        sessionKey,
        prompt,
        provider,
        status: 'running',
        startedAt: timestamp,
        updatedAt: timestamp,
        latestStatus: 'Queued',
        steps: [],
      }
      return {
        ...state,
        [sessionKey]: [nextRun, ...existing.filter((run) => run.id !== runId)].slice(0, 24),
      }
    }
    case 'step': {
      const step = action.payload
      const runs = state[step.sessionKey] ?? []
      return {
        ...state,
        [step.sessionKey]: runs.map((run) =>
          run.id !== step.runId
            ? run
            : {
                ...run,
                updatedAt: step.timestamp,
                latestStatus: step.title,
                steps: [...run.steps, step].slice(-200),
              },
        ),
      }
    }
    case 'finish': {
      const { runId, sessionKey, status, latestStatus, timestamp } = action.payload
      const runs = state[sessionKey] ?? []
      return {
        ...state,
        [sessionKey]: runs.map((run) =>
          run.id !== runId
            ? run
            : {
                ...run,
                status,
                latestStatus,
                updatedAt: timestamp,
                completedAt: timestamp,
              },
        ),
      }
    }
    default:
      return state
  }
}

interface AgentTraceContextValue {
  runsBySession: TraceState
  getRunsForSession: (sessionKey: string) => AgentRunRecord[]
}

const AgentTraceContext = createContext<AgentTraceContextValue | null>(null)

export function AgentTraceProvider({ children }: { children: ReactNode }) {
  const [runsBySession, dispatch] = useReducer(reducer, {})

  useEffect(() => {
    const unsubs = [
      on('agent-run-started', (detail) => dispatch({ type: 'start', payload: detail })),
      on('agent-run-step', (detail) => dispatch({ type: 'step', payload: detail })),
      on('agent-run-finished', (detail) => dispatch({ type: 'finish', payload: detail })),
    ]
    return () => unsubs.forEach((unsub) => unsub())
  }, [])

  const value = useMemo<AgentTraceContextValue>(
    () => ({
      runsBySession,
      getRunsForSession: (sessionKey: string) => runsBySession[sessionKey] ?? [],
    }),
    [runsBySession],
  )

  return <AgentTraceContext.Provider value={value}>{children}</AgentTraceContext.Provider>
}

export function useAgentTrace() {
  const context = useContext(AgentTraceContext)
  if (!context) throw new Error('useAgentTrace must be used within AgentTraceProvider')
  return context
}
