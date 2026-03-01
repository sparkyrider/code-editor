'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useGateway } from '@/context/gateway-context'
import { setGithubToken } from '@/lib/github-client'

const STORAGE_KEY = 'code-editor:github-token'

/** Simple obfuscation — not true encryption, but prevents plaintext in localStorage.
 *  On Tauri desktop, use the OS keychain instead (future enhancement). */
function obfuscate(text: string): string {
  return btoa(text.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (42 + (i % 7)))).join(''))
}

function deobfuscate(encoded: string): string {
  try {
    const decoded = atob(encoded)
    return decoded.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (42 + (i % 7)))).join('')
  } catch { return '' }
}

interface GitHubAuthContextValue {
  /** The resolved GitHub token (from gateway or user input) */
  token: string
  /** Where the token came from */
  source: 'gateway' | 'manual' | 'none'
  /** Whether we're still resolving the token */
  loading: boolean
  /** Manually set a token (saved to local storage) */
  setManualToken: (token: string) => void
  /** Clear the manual token */
  clearToken: () => void
  /** Whether the user has a valid token */
  authenticated: boolean
}

const GitHubAuthContext = createContext<GitHubAuthContextValue | null>(null)

export function GitHubAuthProvider({ children }: { children: ReactNode }) {
  const { sendRequest, status: gwStatus } = useGateway()
  const [token, setToken] = useState('')
  const [source, setSource] = useState<'gateway' | 'manual' | 'none'>('none')
  const [loading, setLoading] = useState(true)

  // Try to resolve token from gateway on connect
  useEffect(() => {
    if (gwStatus !== 'connected') return

    let cancelled = false
    ;(async () => {
      try {
        // Ask the gateway for its GitHub token via RPC
        const result = await sendRequest('env.get', { key: 'GITHUB_TOKEN' }) as { value?: string } | null
        if (cancelled) return

        if (result?.value) {
          setToken(result.value)
          setSource('gateway')
          setGithubToken(result.value)
          setLoading(false)
          return
        }
      } catch {
        // Gateway doesn't support env.get — that's fine
      }

      // Fallback: check localStorage for a manually saved token
      if (!cancelled) {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const t = deobfuscate(stored)
          if (t) {
            setToken(t)
            setSource('manual')
            setGithubToken(t)
          }
        }
        setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [gwStatus, sendRequest])

  // Also check localStorage on mount (before gateway connects)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const t = deobfuscate(stored)
      if (t) {
        setToken(t)
        setSource('manual')
        setGithubToken(t)
      }
    }
    // Give gateway a chance to override, then stop loading
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const setManualToken = useCallback((t: string) => {
    const trimmed = t.trim()
    if (!trimmed) return
    localStorage.setItem(STORAGE_KEY, obfuscate(trimmed))
    setToken(trimmed)
    setSource('manual')
    setGithubToken(trimmed)
  }, [])

  const clearToken = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken('')
    setSource('none')
    setGithubToken('')
  }, [])

  return (
    <GitHubAuthContext.Provider value={{
      token,
      source,
      loading,
      setManualToken,
      clearToken,
      authenticated: !!token,
    }}>
      {children}
    </GitHubAuthContext.Provider>
  )
}

export function useGitHubAuth() {
  const ctx = useContext(GitHubAuthContext)
  if (!ctx) throw new Error('useGitHubAuth must be used within GitHubAuthProvider')
  return ctx
}
