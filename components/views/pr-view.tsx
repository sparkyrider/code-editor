'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { useRepo } from '@/context/repo-context'
import { useView } from '@/context/view-context'
import { authHeaders } from '@/lib/github-api'

interface PR {
  number: number
  title: string
  author: string
  state: string
  draft: boolean
  createdAt: string
  updatedAt: string
  labels: string[]
  reviewDecision?: string
  additions: number
  deletions: number
  changedFiles: number
  headRef: string
  baseRef: string
  url: string
}

export function PrView() {
  const { repo } = useRepo()
  const { goBack } = useView()
  const [prs, setPrs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPr, setSelectedPr] = useState<PR | null>(null)
  const [prFiles, setPrFiles] = useState<Array<{ filename: string; status: string; additions: number; deletions: number; patch?: string }>>([])
  const [activeFile, setActiveFile] = useState<{ filename: string; patch?: string } | null>(null)
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open')

  const loadPrs = useCallback(async () => {
    if (!repo) return
    setLoading(true)
    try {
      const state = filter === 'all' ? 'all' : filter
      const resp = await fetch(`https://api.github.com/repos/${repo.fullName}/pulls?state=${state}&per_page=30&sort=updated`, {
        headers: { ...authHeaders(), Accept: 'application/vnd.github.v3+json' },
      })
      if (resp.ok) {
        const data = await resp.json()
        setPrs(data.map((p: any) => ({
          number: p.number,
          title: p.title,
          author: p.user?.login ?? 'unknown',
          state: p.state,
          draft: p.draft,
          createdAt: new Date(p.created_at).toLocaleDateString(),
          updatedAt: new Date(p.updated_at).toLocaleDateString(),
          labels: (p.labels || []).map((l: any) => l.name),
          additions: p.additions ?? 0,
          deletions: p.deletions ?? 0,
          changedFiles: p.changed_files ?? 0,
          headRef: p.head?.ref ?? '',
          baseRef: p.base?.ref ?? '',
          url: p.html_url,
        })))
      }
    } catch {}
    setLoading(false)
  }, [repo, filter])

  useEffect(() => { loadPrs() }, [loadPrs])

  const loadPrFiles = useCallback(async (pr: PR) => {
    setSelectedPr(pr); setPrFiles([]); setActiveFile(null)
    try {
      const resp = await fetch(`https://api.github.com/repos/${repo?.fullName}/pulls/${pr.number}/files?per_page=100`, {
        headers: { ...authHeaders(), Accept: 'application/vnd.github.v3+json' },
      })
      if (resp.ok) {
        const data = await resp.json()
        setPrFiles(data.map((f: any) => ({ filename: f.filename, status: f.status, additions: f.additions, deletions: f.deletions, patch: f.patch })))
      }
    } catch {}
  }, [repo])

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* PR list */}
      <div className="w-[340px] flex flex-col border-r border-[var(--border)] bg-[var(--bg)] shrink-0">
        <div className="flex items-center justify-between h-10 px-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={goBack} className="p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-tertiary)] cursor-pointer"><Icon icon="lucide:arrow-left" width={13} height={13} /></button>
            <Icon icon="lucide:git-pull-request" width={13} height={13} className="text-[var(--brand)]" />
            <span className="text-[11px] font-semibold text-[var(--text-primary)]">Pull Requests</span>
          </div>
          <button onClick={loadPrs} className="p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-tertiary)] cursor-pointer"><Icon icon="lucide:refresh-cw" width={11} height={11} className={loading ? 'animate-spin' : ''} /></button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0 h-8 border-b border-[var(--border)] px-3 shrink-0">
          {(['open', 'closed', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-[10px] font-medium rounded cursor-pointer ${filter === f ? 'text-[var(--text-primary)] bg-[var(--bg-subtle)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* PR list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center"><Icon icon="lucide:loader" width={16} height={16} className="mx-auto animate-spin text-[var(--brand)]" /></div>
          ) : prs.length > 0 ? prs.map(pr => (
            <button key={pr.number} onClick={() => loadPrFiles(pr)} className={`w-full text-left px-3 py-2.5 border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] cursor-pointer ${selectedPr?.number === pr.number ? 'bg-[color-mix(in_srgb,var(--brand)_8%,transparent)]' : ''}`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <Icon icon={pr.draft ? 'lucide:git-pull-request-draft' : pr.state === 'open' ? 'lucide:git-pull-request' : 'lucide:git-merge'} width={12} height={12} className={pr.state === 'open' ? 'text-[var(--color-additions)]' : 'text-[var(--brand)]'} />
                <span className="text-[11px] font-medium text-[var(--text-primary)] truncate flex-1">{pr.title}</span>
              </div>
              <div className="flex items-center gap-1.5 ml-[19px]">
                <span className="text-[9px] text-[var(--text-disabled)]">#{pr.number}</span>
                <span className="text-[9px] text-[var(--text-disabled)]">&middot;</span>
                <span className="text-[9px] text-[var(--text-tertiary)]">{pr.author}</span>
                <span className="text-[9px] text-[var(--text-disabled)]">&middot;</span>
                <span className="text-[9px] text-[var(--text-disabled)]">{pr.updatedAt}</span>
                {pr.changedFiles > 0 && <span className="ml-auto text-[8px] font-mono text-[var(--text-disabled)]">{pr.changedFiles} files</span>}
              </div>
              {pr.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-[19px] mt-1">
                  {pr.labels.slice(0, 3).map(l => <span key={l} className="px-1.5 py-0.5 rounded-full text-[8px] bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">{l}</span>)}
                </div>
              )}
            </button>
          )) : (
            <div className="py-8 text-center"><Icon icon="lucide:git-pull-request" width={24} height={24} className="mx-auto mb-2 text-[var(--text-disabled)] opacity-30" /><p className="text-[10px] text-[var(--text-disabled)]">No pull requests found</p></div>
          )}
        </div>
      </div>

      {/* PR detail / diff */}
      <div className="flex-1 flex flex-col bg-[var(--bg-elevated)] overflow-hidden">
        {selectedPr ? (
          <>
            <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)] shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={selectedPr.draft ? 'lucide:git-pull-request-draft' : 'lucide:git-pull-request'} width={14} height={14} className={selectedPr.state === 'open' ? 'text-[var(--color-additions)]' : 'text-[var(--brand)]'} />
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">{selectedPr.title}</span>
                <span className="text-[10px] text-[var(--text-disabled)]">#{selectedPr.number}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[var(--text-tertiary)]">{selectedPr.author}</span>
                <span className="text-[var(--text-disabled)]">wants to merge</span>
                <span className="font-mono text-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] px-1.5 rounded">{selectedPr.headRef}</span>
                <span className="text-[var(--text-disabled)]">→</span>
                <span className="font-mono text-[var(--text-secondary)] bg-[var(--bg)] px-1.5 rounded">{selectedPr.baseRef}</span>
                <span className="ml-auto font-mono text-[var(--color-additions)]">+{selectedPr.additions}</span>
                <span className="font-mono text-[var(--color-deletions)]">-{selectedPr.deletions}</span>
              </div>
            </div>

            {activeFile ? (
              <>
                <div className="flex items-center gap-2 h-8 px-4 border-b border-[var(--border)] bg-[var(--bg)] shrink-0">
                  <button onClick={() => setActiveFile(null)} className="p-0.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-tertiary)] cursor-pointer"><Icon icon="lucide:arrow-left" width={11} height={11} /></button>
                  <span className="text-[10px] font-mono text-[var(--text-primary)]">{activeFile.filename}</span>
                </div>
                <div className="flex-1 overflow-auto font-mono text-[11px] leading-[1.55]">
                  {activeFile.patch ? <pre className="p-3 text-[var(--text-secondary)]">{activeFile.patch.split('\n').map((line, i) => <div key={i} className={line.startsWith('+') && !line.startsWith('+++') ? 'bg-[color-mix(in_srgb,var(--color-additions)_10%,transparent)] text-[var(--color-additions)]' : line.startsWith('-') && !line.startsWith('---') ? 'bg-[color-mix(in_srgb,var(--color-deletions)_10%,transparent)] text-[var(--color-deletions)]' : line.startsWith('@@') ? 'text-[var(--brand)] font-semibold' : ''}>{line}</div>)}</pre> : <div className="p-4 text-center text-[var(--text-disabled)]">Binary file</div>}
                </div>
              </>
            ) : prFiles.length > 0 ? (
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-2 text-[9px] font-semibold uppercase text-[var(--text-disabled)] tracking-wider">{prFiles.length} file{prFiles.length !== 1 ? 's' : ''} changed</div>
                {prFiles.map(f => (
                  <button key={f.filename} onClick={() => setActiveFile(f)} className="w-full text-left flex items-center gap-2 px-4 py-1.5 hover:bg-[var(--bg-subtle)] cursor-pointer border-b border-[var(--border)]">
                    <Icon icon={f.status === 'added' ? 'lucide:plus' : f.status === 'removed' ? 'lucide:minus' : 'lucide:pencil'} width={10} height={10} className={f.status === 'added' ? 'text-[var(--color-additions)]' : f.status === 'removed' ? 'text-[var(--color-deletions)]' : 'text-[var(--warning,#eab308)]'} />
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] truncate flex-1">{f.filename}</span>
                    <span className="text-[8px] font-mono text-[var(--color-additions)]">+{f.additions}</span>
                    <span className="text-[8px] font-mono text-[var(--color-deletions)]">-{f.deletions}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center"><Icon icon="lucide:loader" width={16} height={16} className="animate-spin text-[var(--brand)]" /></div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[11px] text-[var(--text-disabled)]">
            <div className="text-center"><Icon icon="lucide:git-pull-request" width={28} height={28} className="mx-auto mb-2 opacity-30" /><p>Select a pull request to review</p></div>
          </div>
        )}
      </div>
    </div>
  )
}
