'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WorkshopBlueprint } from '@/lib/agent-workshop/types'
import { buildWorkshopSystemPrompt } from '@/lib/agent-workshop/prompt'

interface AgentTestPanelProps {
  blueprint: WorkshopBlueprint
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const TEST_SCENARIOS = [
  {
    id: 'simple-task',
    label: 'Simple Task',
    prompt: 'Create a simple React component that displays "Hello World"',
  },
  {
    id: 'complex-feature',
    label: 'Complex Feature',
    prompt: 'Design and implement a user authentication system with JWT tokens',
  },
  {
    id: 'debugging',
    label: 'Debugging',
    prompt: 'I have a bug where my API returns undefined. Can you help debug it?',
  },
  {
    id: 'refactoring',
    label: 'Refactoring',
    prompt: 'Refactor this legacy code to use modern best practices',
  },
  {
    id: 'custom',
    label: 'Custom Prompt',
    prompt: '',
  },
]

export function AgentTestPanel({ blueprint }: AgentTestPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState('simple-task')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const systemPrompt = buildWorkshopSystemPrompt(blueprint)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    if (!input.trim() || isThinking) return

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    // Simulate agent response (in real implementation, this would call the actual agent)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: `[Test Mode] I received your request: "${input.trim()}". In a live environment, I would process this using the configured agent settings:\n\n• Identity: ${blueprint.identity.name}\n• Skills: ${blueprint.skillIds.length} enabled\n• Tools: ${blueprint.toolIds.length} enabled\n• Guardrails: ${blueprint.guardrails.profileId} profile\n\nThis is a mock response for testing purposes.`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsThinking(false)
    }, 1500)
  }, [input, isThinking, blueprint])

  const handleClear = useCallback(() => {
    setMessages([])
    setInput('')
  }, [])

  const handleScenarioSelect = useCallback((scenarioId: string) => {
    setSelectedScenario(scenarioId)
    const scenario = TEST_SCENARIOS.find((s) => s.id === scenarioId)
    if (scenario && scenario.prompt) {
      setInput(scenario.prompt)
    }
  }, [])

  return (
    <div className="grid grid-cols-2 gap-6 min-h-[600px]">
      {/* Left: Config Preview */}
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Agent Configuration
              </h3>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Current blueprint settings for testing
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-disabled)] mb-2">
                Identity
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {blueprint.identity.name || 'Unnamed Agent'}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {blueprint.identity.tagline || 'No tagline set'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-disabled)] mb-2">
                  Skills
                </div>
                <div className="text-2xl font-bold text-[var(--brand)]">
                  {blueprint.skillIds.length}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-disabled)] mb-2">
                  Tools
                </div>
                <div className="text-2xl font-bold text-[var(--brand)]">
                  {blueprint.toolIds.length}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-[var(--text-disabled)] mb-2">
                Guardrails Profile
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                {blueprint.guardrails.profileId}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand)]"
          >
            <Icon icon="lucide:code-2" width={16} height={16} />
            {showSystemPrompt ? 'Hide' : 'View'} System Prompt
          </button>
        </div>

        {showSystemPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Generated System Prompt
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(systemPrompt)
                }}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                <Icon icon="lucide:copy" width={14} height={14} />
              </button>
            </div>
            <pre className="max-h-[300px] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 text-xs leading-6 text-[var(--text-secondary)] whitespace-pre-wrap break-words">
              {systemPrompt}
            </pre>
          </motion.div>
        )}
      </div>

      {/* Right: Test Chat */}
      <div className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]">
        {/* Header */}
        <div className="border-b border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Test Agent</h3>
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Try your agent with test scenarios
              </p>
            </div>
            <button
              onClick={handleClear}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              Clear
            </button>
          </div>

          {/* Scenario Selector */}
          <select
            value={selectedScenario}
            onChange={(e) => handleScenarioSelect(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)]"
          >
            {TEST_SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Icon
                  icon="lucide:message-circle"
                  width={48}
                  height={48}
                  className="mx-auto mb-3 text-[var(--text-disabled)]"
                />
                <p className="text-sm text-[var(--text-secondary)]">
                  No messages yet. Select a scenario or type a message to start testing.
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                      <Icon icon="lucide:bot" width={16} height={16} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-[var(--brand)] text-white'
                        : 'border border-[var(--border)] bg-[var(--bg)]'
                    }`}
                  >
                    <p
                      className={`text-sm whitespace-pre-wrap ${
                        message.role === 'user' ? 'text-white' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {message.content}
                    </p>
                    <div
                      className={`mt-2 text-[10px] ${
                        message.role === 'user'
                          ? 'text-white/70'
                          : 'text-[var(--text-disabled)]'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] border border-[var(--border)]">
                      <Icon icon="lucide:user" width={16} height={16} />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white">
                <Icon icon="lucide:bot" width={16} height={16} />
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-[var(--text-disabled)] animate-bounce" />
                  <div
                    className="h-2 w-2 rounded-full bg-[var(--text-disabled)] animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-[var(--text-disabled)] animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border)] p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type a message to test the agent..."
              disabled={isThinking}
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-2.5 text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon="lucide:send" width={18} height={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
