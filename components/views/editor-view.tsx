'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Icon } from '@iconify/react'
import { useEditor } from '@/context/editor-context'
import { useLocal } from '@/context/local-context'

const FileExplorer = dynamic(() => import('@/components/file-explorer').then(m => ({ default: m.FileExplorer })), { ssr: false })
const CodeEditor = dynamic(() => import('@/components/code-editor').then(m => ({ default: m.CodeEditor })), { ssr: false })
const TerminalPanel = dynamic(() => import('@/components/terminal-panel').then(m => ({ default: m.TerminalPanel })), { ssr: false })
const EnginePanel = dynamic(() => import('@/components/engine-panel').then(m => ({ default: m.EnginePanel })), { ssr: false })

export function EditorView() {
  const { files, activeFile } = useEditor()
  const local = useLocal()

  const [treeVisible, setTreeVisible] = useState(true)
  const [treeWidth, setTreeWidth] = useState(240)
  const [terminalVisible, setTerminalVisible] = useState(false)
  const [terminalHeight, setTerminalHeight] = useState(260)
  const [engineVisible, setEngineVisible] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') { e.preventDefault(); setTreeVisible(v => !v) }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') { e.preventDefault(); setTerminalVisible(v => !v) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const hasFiles = files.length > 0 || activeFile

  return (
    <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden relative">
      {/* File Tree */}
      {treeVisible && (
        <div className="shrink-0 bg-[var(--sidebar-bg)] overflow-hidden border-r border-[var(--border)] flex flex-col" style={{ width: treeWidth }}>
          <div className="flex items-center justify-between h-8 px-2.5 border-b border-[var(--border)] shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-disabled)]">Explorer</span>
            <button onClick={() => setTreeVisible(false)} className="p-0.5 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-disabled)] hover:text-[var(--text-secondary)] cursor-pointer" title="Hide (⌘B)">
              <Icon icon="lucide:panel-left-close" width={12} height={12} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto"><FileExplorer /></div>
        </div>
      )}

      {treeVisible && (
        <div className="w-1 cursor-col-resize hover:bg-[var(--brand)] transition-colors opacity-0 hover:opacity-60 shrink-0"
          onMouseDown={e => {
            e.preventDefault(); const startX = e.clientX; const startW = treeWidth
            const onMove = (ev: MouseEvent) => setTreeWidth(Math.max(160, Math.min(400, startW + (ev.clientX - startX))))
            const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
            document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
          }}
        />
      )}

      {/* Editor column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {!treeVisible && (
          <button onClick={() => setTreeVisible(true)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-4 h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border)] rounded-r-md hover:bg-[var(--bg-subtle)] text-[var(--text-disabled)] hover:text-[var(--text-secondary)] cursor-pointer" title="Show explorer (⌘B)">
            <Icon icon="lucide:chevron-right" width={10} height={10} />
          </button>
        )}

        {hasFiles ? (
          <>
            <div className="flex-1 min-h-0"><CodeEditor /></div>
            {(terminalVisible || engineVisible) && (
              <div className="h-1 cursor-row-resize hover:bg-[var(--brand)] transition-colors opacity-0 hover:opacity-60 shrink-0"
                onMouseDown={e => {
                  e.preventDefault(); const startY = e.clientY; const startH = terminalHeight
                  const onMove = (ev: MouseEvent) => setTerminalHeight(Math.max(120, Math.min(500, startH - (ev.clientY - startY))))
                  const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
                  document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
                }}
              />
            )}
            {terminalVisible && <div className="shrink-0 border-t border-[var(--border)]" style={{ height: terminalHeight }}><TerminalPanel visible={terminalVisible} height={terminalHeight} onHeightChange={setTerminalHeight} /></div>}
            {engineVisible && !terminalVisible && <div className="shrink-0 border-t border-[var(--border)]" style={{ height: terminalHeight }}><EnginePanel /></div>}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon icon="lucide:file-code-2" width={32} height={32} className="mx-auto mb-3 text-[var(--text-disabled)] opacity-30" />
              <p className="text-[12px] text-[var(--text-tertiary)] mb-1">No file open</p>
              <p className="text-[10px] text-[var(--text-disabled)]">Open a file from the explorer or use <kbd className="px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[9px] font-mono">⌘P</kbd></p>
            </div>
          </div>
        )}

        {/* Editor bottom bar */}
        <div className="flex items-center h-6 px-2 border-t border-[var(--border)] bg-[var(--bg-elevated)] shrink-0 gap-2">
          <button onClick={() => setTreeVisible(v => !v)} className={`p-0.5 rounded hover:text-[var(--text-secondary)] cursor-pointer ${treeVisible ? 'text-[var(--brand)]' : 'text-[var(--text-disabled)]'}`} title="Explorer (⌘B)">
            <Icon icon="lucide:folder" width={11} height={11} />
          </button>
          <button onClick={() => setTerminalVisible(v => !v)} className={`p-0.5 rounded hover:text-[var(--text-secondary)] cursor-pointer ${terminalVisible ? 'text-[var(--brand)]' : 'text-[var(--text-disabled)]'}`} title="Terminal (⌘J)">
            <Icon icon="lucide:terminal" width={11} height={11} />
          </button>
          <button onClick={() => setEngineVisible(v => !v)} className={`p-0.5 rounded hover:text-[var(--text-secondary)] cursor-pointer ${engineVisible ? 'text-[var(--brand)]' : 'text-[var(--text-disabled)]'}`} title="Engine">
            <Icon icon="lucide:cpu" width={11} height={11} />
          </button>
          <div className="flex-1" />
          {local.gitInfo?.branch && (
            <span className="text-[9px] font-mono text-[var(--text-disabled)] flex items-center gap-1">
              <Icon icon="lucide:git-branch" width={9} height={9} />{local.gitInfo.branch}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
