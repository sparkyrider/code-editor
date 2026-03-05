'use client'

import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import { Icon } from '@iconify/react'
import { KnotLogo } from '@/components/knot-logo'
import { KnotBackground } from '@/components/knot-background'
import { ModeSelector } from '@/components/mode-selector'
import type { AgentMode } from '@/components/mode-selector'
import { useRepo } from '@/context/repo-context'
import { useLocal } from '@/context/local-context'
import { useGateway } from '@/context/gateway-context'
import { useGitHubAuth } from '@/context/github-auth-context'
import { useEditor } from '@/context/editor-context'
import { emit } from '@/lib/events'
import { getRecentFolders } from '@/context/local-context'
import { getAgentConfig } from '@/lib/agent-session'

const STATIC_SUGGESTIONS = [
  {
    icon: 'lucide:rocket',
    label: 'Scaffold a project',
    prompt:
      'Create a new project with a sensible folder structure, dependency file, and a basic README',
    desc: 'Start from scratch',
  },
  {
    icon: 'lucide:layout-template',
    label: 'Build a component',
    prompt: 'Build a reusable, accessible UI component with props, types, and styling',
    desc: 'React / HTML / Vue',
  },
  {
    icon: 'lucide:server',
    label: 'Design an API',
    prompt: 'Design a REST API with route handlers, request validation, and error responses',
    desc: 'Endpoints & schemas',
  },
  {
    icon: 'lucide:database',
    label: 'Set up a database',
    prompt: 'Set up a database schema with tables, relationships, and migration files',
    desc: 'SQL / ORM models',
  },
]
const TOKEN_REVEAL_TIMEOUT_MS = 15000

/** Get recent conversation previews from localStorage */
function getRecentConversations(): Array<{
  title: string
  timestamp: number
  messageCount: number
}> {
  try {
    const saved = localStorage.getItem('code-editor:chat:main')
    if (!saved) return []
    const messages = (
      JSON.parse(saved) as Array<{
        role: string
        content: string
        timestamp: number
      }>
    ).filter((m) => {
      const c = m.content?.slice(0, 120) ?? ''
      return !c.includes('You are KnotCode Agent') && !c.includes('KnotCode system prompt')
    })
    if (!messages.length) return []
    const firstUser = messages.find((m) => m.role === 'user')
    if (!firstUser) return []
    return [
      {
        title: firstUser.content.slice(0, 60).replace(/\n/g, ' '),
        timestamp: messages[messages.length - 1].timestamp,
        messageCount: messages.length,
      },
    ]
  } catch {
    return []
  }
}

/** Detect primary language from file extensions */
function detectPrimaryLanguage(files: Array<{ path: string; is_dir: boolean }>): string | null {
  const extCounts: Record<string, number> = {}
  const langMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'TypeScript',
    js: 'JavaScript',
    jsx: 'JavaScript',
    py: 'Python',
    rs: 'Rust',
    go: 'Go',
    rb: 'Ruby',
    java: 'Java',
    swift: 'Swift',
    kt: 'Kotlin',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    php: 'PHP',
    vue: 'Vue',
    svelte: 'Svelte',
  }
  for (const f of files) {
    if (f.is_dir) continue
    const ext = f.path.split('.').pop()?.toLowerCase() ?? ''
    if (langMap[ext]) extCounts[ext] = (extCounts[ext] ?? 0) + 1
  }
  const top = Object.entries(extCounts).sort((a, b) => b[1] - a[1])[0]
  return top ? (langMap[top[0]] ?? null) : null
}

function IconButton({
  icon,
  title,
  size = 14,
  onClick,
  className = '',
}: {
  icon: string
  title: string
  size?: number
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-md text-[var(--text-disabled)] hover:text-[var(--text-tertiary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] transition-colors cursor-pointer ${className}`}
      title={title}
      aria-label={title}
    >
      <Icon icon={icon} width={size} height={size} />
    </button>
  )
}

interface Props {
  onSend: (text: string, mode: AgentMode) => void
  onSelectFolder: () => void
  onCloneRepo: () => void
  onImageAttach?: () => void
  imageAttachments?: Array<{ name: string; dataUrl: string }>
  onRemoveImage?: (index: number) => void
}

export const ChatHome = memo(function ChatHome({
  onSend,
  onSelectFolder,
  onCloneRepo,
  onImageAttach,
  imageAttachments = [],
  onRemoveImage,
}: Props) {
  const [input, setInput] = useState('')
  const [agentMode, setAgentMode] = useState<AgentMode>('ask')
  const [isFocused, setIsFocused] = useState(false)
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [tokenDraft, setTokenDraft] = useState('')
  const [tokenRevealed, setTokenRevealed] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [ghSectionOpen, setGhSectionOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const { repo } = useRepo()
  const local = useLocal()
  const { status } = useGateway()
  const { token: ghToken, authenticated, setManualToken, clearToken } = useGitHubAuth()
  const { files: openFiles } = useEditor()

  const repoShort = useMemo(
    () => repo?.fullName?.split('/').pop() ?? local.rootPath?.split('/').pop() ?? null,
    [repo?.fullName, local.rootPath],
  )
  const hasWorkspace = !!repoShort

  const [recentFolders, setRecentFolders] = useState<string[]>(() => getRecentFolders())
  const [recentConversations, setRecentConversations] = useState(() => getRecentConversations())
  const agentConfig = useMemo(() => getAgentConfig(), [])

  useEffect(() => {
    setRecentFolders(getRecentFolders())
    setRecentConversations(getRecentConversations())
  }, [local.rootPath])

  // Workspace stats
  const wsTreeFiles = local.localTree?.filter((e) => !e.is_dir) ?? []
  const fileCount = wsTreeFiles.length
  const primaryLanguage = useMemo(
    () => detectPrimaryLanguage(local.localTree ?? []),
    [local.localTree],
  )
  const branchName = local.gitInfo?.branch ?? null

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!tokenRevealed) return
    const timer = setTimeout(() => setTokenRevealed(false), TOKEN_REVEAL_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [tokenRevealed])

  useEffect(() => {
    if (!tokenCopied) return
    const timer = setTimeout(() => setTokenCopied(false), 1600)
    return () => clearTimeout(timer)
  }, [tokenCopied])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = '0'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  const [isComposing, setIsComposing] = useState(false)

  /** Centralized action: send message if text, or open empty chat */
  const startOrSend = useCallback(() => {
    const t = input.trim()
    onSend(t || '', agentMode)
    setInput('')
  }, [input, agentMode, onSend])

  const handleSubmit = startOrSend

  const handleSaveToken = useCallback(() => {
    const trimmed = tokenDraft.trim()
    if (!trimmed) return
    setManualToken(trimmed)
    setTokenDraft('')
    setShowTokenInput(false)
    setTokenRevealed(false)
    setTokenCopied(false)
  }, [tokenDraft, setManualToken])

  const handleToggleReveal = useCallback(() => {
    if (tokenRevealed) {
      setTokenRevealed(false)
      return
    }
    const ok = window.confirm('Reveal token for 15 seconds? Avoid this while screen sharing.')
    if (ok) setTokenRevealed(true)
  }, [tokenRevealed])

  const handleCopyToken = useCallback(async () => {
    if (!ghToken) return
    try {
      await navigator.clipboard.writeText(ghToken)
      setTokenCopied(true)
    } catch {
      // Ignore clipboard errors (unsupported context or denied permission).
    }
  }, [ghToken])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ignore Enter during IME composition
      if (isComposing) return
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        startOrSend()
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        startOrSend()
      }
      if (e.key === 'Tab' && !input.trim()) {
        e.preventDefault()
        setAgentMode((m) => (m === 'ask' ? 'agent' : 'ask'))
      }
    },
    [startOrSend, input, isComposing],
  )

  const maskedToken = ghToken
    ? `${ghToken.slice(0, 4)}${'•'.repeat(Math.min(ghToken.length - 8, 24))}${ghToken.slice(-4)}`
    : ''

  const suggestions = useMemo(() => {
    if (!hasWorkspace) return STATIC_SUGGESTIONS

    const contextChips: typeof STATIC_SUGGESTIONS = []
    const langLabel = primaryLanguage ?? 'this project'

    if (openFiles.length > 0) {
      const recent = openFiles[openFiles.length - 1]
      const name = recent.path.split('/').pop() || recent.path
      contextChips.push({
        icon: 'lucide:sparkles',
        label: `Refactor ${name}`,
        prompt: `Refactor ${recent.path} — improve readability, reduce duplication, and simplify complex logic`,
        desc: 'Clean up this file',
      })
    }

    const ctxTreeFiles = local.localTree?.filter((e) => !e.is_dir) ?? []
    const entryFile = ctxTreeFiles.find(
      (f) =>
        /(^|\/)((index|main|app|server|lib)\.(ts|tsx|js|jsx|py|rs|go)|main\.rs|mod\.rs)$/.test(
          f.path,
        ) && !f.path.includes('node_modules'),
    )
    if (entryFile) {
      const name = entryFile.path.split('/').pop() || entryFile.path
      contextChips.push({
        icon: 'lucide:map',
        label: `Walk through ${name}`,
        prompt: `Explain the architecture of ${entryFile.path} — what it does, how data flows, and how it connects to the rest of the codebase`,
        desc: 'Understand the entry point',
      })
    }

    if (contextChips.length < 4) {
      contextChips.push({
        icon: 'lucide:test-tubes',
        label: `Add tests`,
        prompt: `Write unit tests for the core modules in this ${langLabel} project, covering edge cases and error paths`,
        desc: `Test coverage for ${langLabel}`,
      })
    }

    if (contextChips.length < 4) {
      const hasGit = !!branchName
      if (hasGit) {
        contextChips.push({
          icon: 'lucide:git-pull-request',
          label: `Review changes`,
          prompt: `Review the uncommitted changes on the ${branchName} branch — flag potential bugs, suggest improvements, and check for missing edge cases`,
          desc: `Diff review on ${branchName}`,
        })
      } else {
        contextChips.push({
          icon: 'lucide:search-code',
          label: `Find issues`,
          prompt: `Scan this ${langLabel} codebase for common bugs, anti-patterns, and potential runtime errors`,
          desc: 'Static analysis pass',
        })
      }
    }

    if (contextChips.length < 4) {
      contextChips.push({
        icon: 'lucide:file-plus-2',
        label: 'Generate docs',
        prompt: `Generate clear documentation for the public API surface of this ${langLabel} project, including usage examples`,
        desc: 'API docs & examples',
      })
    }

    return contextChips.slice(0, 4)
  }, [hasWorkspace, openFiles, local.localTree, primaryLanguage, branchName])

  return (
    <div className="flex-1 overflow-y-auto relative">
      <KnotBackground />
      <div className="min-h-full w-full max-w-[680px] mx-auto flex flex-col justify-center px-6 py-12 relative z-[1]">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div
            className={`mb-5 ${
              status === 'connected' ? 'logo-breathe-connected' : 'logo-breathe-idle'
            }`}
          >
            <KnotLogo size={36} color="var(--brand)" />
          </div>

          <h1 className="text-center text-[28px] font-semibold tracking-[-0.04em] leading-none text-[var(--text-primary)]">
            KnotCode
          </h1>
          <p className="mt-2 text-center text-[13px] text-[var(--text-disabled)] font-normal tracking-[-0.01em]">
            {repoShort ? `What should we work on?` : `Open a file or start a conversation to begin`}
          </p>

          {/* Status chips */}
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            <span
              className={`home-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide uppercase ${
                status === 'connected'
                  ? 'text-[var(--success)] bg-[color-mix(in_srgb,var(--success)_8%,transparent)] border border-[color-mix(in_srgb,var(--success)_15%,transparent)]'
                  : 'text-[var(--text-disabled)] bg-[color-mix(in_srgb,var(--text-disabled)_6%,transparent)] border border-[var(--border)]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-[var(--success)] home-pulse-dot' : 'bg-[var(--text-disabled)]'}`}
              />
              {status === 'connected' ? 'Connected' : 'Offline'}
            </span>

            {hasWorkspace && (
              <button
                onClick={onSelectFolder}
                className="home-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide uppercase text-[var(--text-secondary)] bg-[color-mix(in_srgb,var(--text-primary)_4%,transparent)] border border-[var(--border)] hover:border-[var(--text-disabled)] transition-colors cursor-pointer"
              >
                <Icon icon="lucide:folder" width={10} height={10} />
                {repoShort}
              </button>
            )}

            {hasWorkspace && primaryLanguage && (
              <span className="home-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide uppercase text-[var(--text-disabled)] bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)] border border-[var(--border)]">
                <Icon icon="lucide:code-2" width={10} height={10} />
                {primaryLanguage}
              </span>
            )}

            {hasWorkspace && branchName && (
              <span className="home-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide uppercase text-[var(--text-disabled)] bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)] border border-[var(--border)]">
                <Icon icon="lucide:git-branch" width={10} height={10} />
                {branchName}
              </span>
            )}

            {hasWorkspace && fileCount > 0 && (
              <span className="home-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide uppercase text-[var(--text-disabled)] bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)] border border-[var(--border)]">
                {fileCount} files
              </span>
            )}

            {agentConfig && (
              <button
                onClick={() => emit('open-agent-settings')}
                className="home-chip inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide uppercase text-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_6%,transparent)] border border-[color-mix(in_srgb,var(--brand)_15%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] transition-colors cursor-pointer"
              >
                {agentConfig.persona === 'fullstack'
                  ? 'Full-Stack'
                  : agentConfig.persona === 'frontend'
                    ? 'Frontend'
                    : agentConfig.persona === 'security'
                      ? 'Security'
                      : agentConfig.persona === 'architect'
                        ? 'Architect'
                        : 'Custom'}
              </button>
            )}
          </div>
        </div>

        {/* Composer */}
        <div
          ref={cardRef}
          onClick={() => inputRef.current?.focus()}
          className={`home-composer rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-200 ${
            isFocused
              ? input.trim()
                ? 'home-composer-typing border-[color-mix(in_srgb,var(--brand)_50%,var(--border))]'
                : 'home-composer-focused border-[color-mix(in_srgb,var(--brand)_25%,var(--border))]'
              : 'border-[var(--border)] hover:border-[color-mix(in_srgb,var(--text-disabled)_60%,var(--border))]'
          }`}
          style={{ background: 'color-mix(in srgb, var(--bg-elevated) 80%, transparent)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={
              repoShort ? `Ask anything about ${repoShort}…` : 'Describe what you want to build…'
            }
            aria-label={
              repoShort ? `Ask anything about ${repoShort}` : 'Describe what you want to build'
            }
            className="w-full bg-transparent px-4 pt-4 pb-1 text-[14px] leading-[1.6] text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none resize-none min-h-[48px] max-h-[200px] overflow-y-auto"
          />

          {/* Image previews */}
          {imageAttachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-1">
              {imageAttachments.map((img, i) => (
                <div
                  key={i}
                  className="relative group/img rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] overflow-hidden"
                  style={{ width: 72, height: 48 }}
                >
                  <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-1">
                    <span className="text-[7px] text-white/90 font-mono truncate">{img.name}</span>
                  </div>
                  {onRemoveImage && (
                    <button
                      onClick={() => onRemoveImage(i)}
                      className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-black/50 text-white/80 hover:bg-red-500/80 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer"
                    >
                      <Icon icon="lucide:x" width={7} height={7} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="px-3 pb-2.5 pt-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <IconButton icon="lucide:paperclip" title="Attach file" />
                <IconButton icon="lucide:image-plus" title="Attach image" onClick={onImageAttach} />
                <IconButton icon="lucide:at-sign" title="@ mention file" />
                <div className="w-px h-3.5 bg-[var(--border)] mx-1.5" />
                <ModeSelector mode={agentMode} onChange={setAgentMode} size="sm" />
              </div>

              <button
                onClick={startOrSend}
                aria-label={input.trim() ? 'Send message' : 'Start chat'}
                className={`home-send-btn flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-medium transition-all cursor-pointer active:scale-95 ${
                  input.trim()
                    ? 'bg-[var(--brand)] text-[var(--brand-contrast,#fff)] shadow-[0_0_12px_color-mix(in_srgb,var(--brand)_20%,transparent)]'
                    : 'bg-[color-mix(in_srgb,var(--text-primary)_8%,transparent)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_12%,transparent)]'
                }`}
              >
                <Icon
                  icon={input.trim() ? 'lucide:arrow-up' : 'lucide:arrow-right'}
                  width={14}
                  height={14}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          {suggestions.slice(0, 4).map((a, i) => (
            <button
              key={a.label}
              onClick={() => onSend(a.prompt, agentMode)}
              aria-label={a.prompt}
              className="home-action-card chip-enter group flex items-start gap-3 px-3.5 py-3 rounded-lg text-left cursor-pointer border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_60%,transparent)] backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="w-7 h-7 rounded-md bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] border border-[color-mix(in_srgb,var(--brand)_12%,transparent)] flex items-center justify-center shrink-0 mt-0.5">
                <Icon
                  icon={a.icon}
                  width={13}
                  height={13}
                  className="text-[var(--brand)] opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {a.label}
                </div>
                {'desc' in a && a.desc && (
                  <div className="text-[10px] text-[var(--text-disabled)] mt-0.5 leading-relaxed">
                    {a.desc}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Recent conversations */}
        {recentConversations.length > 0 && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-disabled)] font-medium mb-2 font-mono">
              Continue
            </p>
            {recentConversations.map((conv, i) => (
              <button
                key={i}
                onClick={() => onSend('', agentMode)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[color-mix(in_srgb,var(--text-primary)_4%,transparent)] transition-colors cursor-pointer group"
              >
                <Icon
                  icon="lucide:message-square"
                  width={12}
                  height={12}
                  className="text-[var(--text-disabled)] group-hover:text-[var(--text-tertiary)] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate">
                    {conv.title}
                  </div>
                  <div className="text-[10px] text-[var(--text-disabled)] font-mono">
                    {conv.messageCount} msgs · {new Date(conv.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Workspace setup */}
        {!hasWorkspace && (
          <div className="mt-8 space-y-4">
            <div className="h-px bg-[var(--border)]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={onSelectFolder}
                className="home-action-card group flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_60%,transparent)] text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Icon
                    icon="lucide:folder-open"
                    width={14}
                    height={14}
                    className="text-[var(--text-tertiary)]"
                  />
                </div>
                <span className="min-w-0">
                  <span className="block text-[12px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    Open Folder
                  </span>
                  <span className="block text-[10px] text-[var(--text-disabled)] font-mono">
                    local project
                  </span>
                </span>
              </button>
              <button
                onClick={onCloneRepo}
                className="home-action-card group flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_60%,transparent)] text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Icon
                    icon="lucide:git-branch"
                    width={14}
                    height={14}
                    className="text-[var(--text-tertiary)]"
                  />
                </div>
                <span className="min-w-0">
                  <span className="block text-[12px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    Clone Repository
                  </span>
                  <span className="block text-[10px] text-[var(--text-disabled)] font-mono">
                    from GitHub
                  </span>
                </span>
              </button>
            </div>

            {/* Recent folders */}
            {recentFolders.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[var(--text-disabled)] font-medium mb-2 font-mono">
                  Recent
                </p>
                <div className="flex flex-col gap-0.5">
                  {recentFolders.slice(0, 3).map((folder) => {
                    const name = folder.split('/').pop() || folder
                    const parent = folder.split('/').slice(0, -1).join('/') || '/'
                    return (
                      <button
                        key={folder}
                        onClick={() => local.setRootPath(folder)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:bg-[color-mix(in_srgb,var(--text-primary)_4%,transparent)] transition-colors cursor-pointer group"
                      >
                        <Icon
                          icon="lucide:folder"
                          width={13}
                          height={13}
                          className="text-[var(--text-disabled)] group-hover:text-[var(--text-tertiary)] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="text-[12px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate">
                            {name}
                          </div>
                          <div className="text-[10px] text-[var(--text-disabled)] truncate font-mono">
                            {parent}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* GitHub Token */}
            <div>
              <button
                onClick={() => setGhSectionOpen((v) => !v)}
                className="w-full flex items-center gap-3 cursor-pointer group"
              >
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-[var(--text-disabled)] font-medium font-mono group-hover:text-[var(--text-tertiary)] transition-colors">
                  GitHub
                  {authenticated && (
                    <Icon
                      icon="lucide:check-circle"
                      width={10}
                      height={10}
                      className="text-[var(--success)]"
                    />
                  )}
                  <Icon
                    icon={ghSectionOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'}
                    width={10}
                    height={10}
                  />
                </span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </button>

              {ghSectionOpen && (
                <div className="mt-2">
                  {authenticated ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_60%,transparent)]">
                      <Icon
                        icon="lucide:check-circle"
                        width={14}
                        height={14}
                        className="text-[var(--success)] shrink-0"
                      />
                      <span className="text-[11px] text-[var(--text-secondary)] flex-1 font-mono truncate">
                        {tokenRevealed ? ghToken : maskedToken}
                      </span>
                      <IconButton
                        icon={tokenCopied ? 'lucide:check' : 'lucide:copy'}
                        title={tokenCopied ? 'Copied' : 'Copy token'}
                        size={13}
                        onClick={handleCopyToken}
                      />
                      <IconButton
                        icon={tokenRevealed ? 'lucide:eye-off' : 'lucide:eye'}
                        title={tokenRevealed ? 'Hide token' : 'Reveal token'}
                        size={13}
                        onClick={handleToggleReveal}
                      />
                      <button
                        onClick={() => {
                          clearToken()
                          setTokenRevealed(false)
                          setTokenCopied(false)
                        }}
                        className="p-1 rounded-md hover:bg-[color-mix(in_srgb,var(--error)_10%,transparent)] text-[var(--text-disabled)] hover:text-[var(--error)] transition-colors cursor-pointer"
                        title="Remove token"
                        aria-label="Remove token"
                      >
                        <Icon icon="lucide:x" width={13} height={13} />
                      </button>
                    </div>
                  ) : showTokenInput ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-elevated)_60%,transparent)] px-3 py-2 focus-within:border-[var(--border-focus)] transition-colors">
                        <Icon
                          icon="lucide:key"
                          width={13}
                          height={13}
                          className="text-[var(--text-disabled)] shrink-0"
                        />
                        <input
                          type={tokenRevealed ? 'text' : 'password'}
                          value={tokenDraft}
                          onChange={(e) => setTokenDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveToken()
                            if (e.key === 'Escape') {
                              setShowTokenInput(false)
                              setTokenDraft('')
                              setTokenRevealed(false)
                            }
                          }}
                          placeholder="ghp_... or github_pat_..."
                          autoFocus
                          className="flex-1 bg-transparent text-[12px] font-mono text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none min-w-0"
                          autoComplete="off"
                          spellCheck={false}
                          aria-label="GitHub personal access token"
                        />
                        <IconButton
                          icon={tokenRevealed ? 'lucide:eye-off' : 'lucide:eye'}
                          title={tokenRevealed ? 'Hide' : 'Reveal'}
                          size={13}
                          onClick={() => setTokenRevealed((v) => !v)}
                        />
                      </div>
                      <button
                        onClick={handleSaveToken}
                        disabled={!tokenDraft.trim()}
                        className={`px-3.5 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                          tokenDraft.trim()
                            ? 'bg-[var(--brand)] text-[var(--brand-contrast)] hover:bg-[var(--brand-hover)]'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-disabled)] cursor-not-allowed'
                        }`}
                      >
                        Save
                      </button>
                      <IconButton
                        icon="lucide:x"
                        title="Cancel"
                        size={13}
                        onClick={() => {
                          setShowTokenInput(false)
                          setTokenDraft('')
                          setTokenRevealed(false)
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowTokenInput(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-[var(--border)] text-[12px] text-[var(--text-disabled)] font-mono hover:text-[var(--text-secondary)] hover:border-[var(--text-disabled)] transition-all cursor-pointer"
                    >
                      <Icon icon="lucide:key" width={13} height={13} />
                      Add GitHub Token
                    </button>
                  )}
                  <p className="text-[10px] text-[var(--text-disabled)] text-center mt-2 font-mono">
                    {authenticated
                      ? tokenRevealed
                        ? 'Token reveal auto-hides after 15s.'
                        : tokenCopied
                          ? 'Copied.'
                          : 'Stored in OS keychain.'
                      : 'github.com/settings/tokens'}
                  </p>
                </div>
              )}
            </div>

            {/* Agent customization */}
            {!agentConfig && (
              <button
                onClick={() => emit('open-agent-settings')}
                className="home-action-card w-full flex items-center gap-3 px-3.5 py-3 rounded-lg border border-[var(--border)] text-left cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-md bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] border border-[color-mix(in_srgb,var(--brand)_12%,transparent)] flex items-center justify-center shrink-0">
                  <Icon
                    icon="lucide:sparkles"
                    width={13}
                    height={13}
                    className="text-[var(--brand)] opacity-70"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                    Configure Agent
                  </span>
                  <span className="block text-[10px] text-[var(--text-disabled)] font-mono">
                    persona & behavior
                  </span>
                </div>
                <Icon
                  icon="lucide:chevron-right"
                  width={12}
                  height={12}
                  className="text-[var(--text-disabled)] shrink-0"
                />
              </button>
            )}
          </div>
        )}

        {/* Footer watermark */}
        <div className="mt-8 flex justify-center">
          <span className="text-[10px] font-mono tracking-[0.08em] text-[var(--text-disabled)] opacity-40 uppercase">
            KnotCode
          </span>
        </div>
      </div>
    </div>
  )
})
