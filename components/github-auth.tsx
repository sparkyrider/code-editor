'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useGitHubAuth } from '@/context/github-auth-context'

/** Compact header indicator + token input dropdown */
export function GitHubAuthBadge() {
  const { authenticated, source, loading, setManualToken, clearToken } = useGitHubAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [showToken, setShowToken] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 text-[11px] text-[var(--text-tertiary)]">
        <Icon icon="lucide:loader-2" width={12} height={12} className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
          authenticated
            ? 'text-[var(--color-additions)] hover:bg-[var(--bg-subtle)]'
            : 'text-[var(--warning)] hover:bg-[color-mix(in_srgb,var(--warning)_10%,transparent)]'
        }`}
        title={
          authenticated
            ? `GitHub: connected (${source === 'gateway' ? 'via gateway' : 'personal token'})`
            : 'GitHub: not connected — click to add token'
        }
      >
        <Icon icon="lucide:github" width={14} height={14} />
        {authenticated ? (
          <span className="hidden sm:inline">
            {source === 'gateway' ? 'Gateway' : 'Token'}
          </span>
        ) : (
          <span>Connect</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+4px)] z-[91] w-[320px] rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl overflow-hidden">
            <div className="px-3 py-2.5 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="lucide:github" width={14} height={14} className="text-[var(--text-primary)]" />
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">GitHub Connection</span>
              </div>
              {authenticated && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-additions)]" />
                  <span className="text-[var(--text-secondary)]">
                    {source === 'gateway'
                      ? 'Using token from OpenClaw gateway'
                      : 'Using personal access token'}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 space-y-3">
              {authenticated ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      {source === 'gateway'
                        ? 'Token managed by your OpenClaw gateway. No action needed.'
                        : 'Token stored locally on this device.'}
                    </span>
                  </div>
                  {source === 'manual' && (
                    <button
                      onClick={() => { clearToken(); setOpen(false) }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-[var(--color-deletions)] hover:bg-[color-mix(in_srgb,var(--color-deletions)_8%,transparent)] transition-colors cursor-pointer"
                    >
                      <Icon icon="lucide:log-out" width={12} height={12} />
                      Remove token
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                    Connect to GitHub to browse repos, open files, and commit changes.
                    Your token is stored locally and never sent to any server.
                  </p>

                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type={showToken ? 'text' : 'password'}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="ghp_xxxx or github_pat_xxxx"
                        className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none focus:border-[var(--brand)] transition-colors"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && input.trim()) {
                            setManualToken(input.trim())
                            setInput('')
                            setOpen(false)
                          }
                        }}
                      />
                      <button
                        onClick={() => setShowToken(v => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <Icon icon={showToken ? 'lucide:eye-off' : 'lucide:eye'} width={12} height={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (input.trim()) {
                          setManualToken(input.trim())
                          setInput('')
                          setOpen(false)
                        }
                      }}
                      disabled={!input.trim()}
                      className="w-full py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--brand)',
                        color: 'var(--brand-contrast, #fff)',
                      }}
                    >
                      Connect
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[var(--border)]">
                    <a
                      href="https://github.com/settings/tokens/new?description=Code+Editor&scopes=repo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-[var(--brand)] hover:underline"
                    >
                      <Icon icon="lucide:external-link" width={10} height={10} />
                      Generate a new token on GitHub
                    </a>
                    <p className="text-[10px] text-[var(--text-disabled)] mt-1">
                      Needs <code className="text-[var(--text-tertiary)]">repo</code> scope for private repos.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
