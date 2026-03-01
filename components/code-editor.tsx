'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Editor, { type OnMount, type BeforeMount } from '@monaco-editor/react'
import loader from '@monaco-editor/loader'
import { Icon } from '@iconify/react'
import { useEditor } from '@/context/editor-context'
import { registerEditorTheme } from '@/lib/monaco-theme'
import { InlineEdit } from '@/components/inline-edit'

export function CodeEditor() {
  const { files, activeFile, updateFileContent } = useEditor()
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const [monacoReady, setMonacoReady] = useState(false)
  const [inlineEdit, setInlineEdit] = useState<{
    visible: boolean
    position: { top: number; left: number }
    selectedText: string
    startLine: number
    endLine: number
  }>({ visible: false, position: { top: 0, left: 0 }, selectedText: '', startLine: 0, endLine: 0 })

  useEffect(() => {
    let mounted = true

    const initMonaco = async () => {
      const monaco = await import('monaco-editor')
      loader.config({ monaco })

      if (mounted) setMonacoReady(true)
    }

    void initMonaco()

    return () => {
      mounted = false
    }
  }, [])

  const file = files.find(f => f.path === activeFile)

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    // Disable red squiggly lines — Monaco has no tsconfig/types context
    monaco.languages.typescript?.typescriptDefaults?.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })
    monaco.languages.typescript?.javascriptDefaults?.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })
    // Register custom theme matching our CSS variables
    registerEditorTheme(monaco)
  }, [])

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor
    editor.focus()
  }, [])

  // ⌘K: Inline edit at selection (global keyboard listener)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const editor = editorRef.current
        if (!editor) return

        const selection = editor.getSelection()
        const model = editor.getModel()
        if (!selection || !model) return

        const selectedText = model.getValueInRange(selection)
        const pos = editor.getScrolledVisiblePosition(selection.getStartPosition())
        const domNode = editor.getDomNode()
        const rect = domNode?.getBoundingClientRect()

        setInlineEdit({
          visible: true,
          position: {
            top: (rect?.top ?? 0) + (pos?.top ?? 0) + (pos?.height ?? 20) + 4,
            left: (rect?.left ?? 0) + (pos?.left ?? 0),
          },
          selectedText: selectedText || model.getLineContent(selection.startLineNumber),
          startLine: selection.startLineNumber,
          endLine: selection.endLineNumber,
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleChange = useCallback((value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile, value)
    }
  }, [activeFile, updateFileContent])

  // Listen for line navigation events from agent panel
  useEffect(() => {
    const handler = (e: Event) => {
      const { startLine, endLine } = (e as CustomEvent).detail
      const editor = editorRef.current
      if (!editor) return
      editor.revealLineInCenter(startLine)
      editor.setSelection({
        startLineNumber: startLine,
        startColumn: 1,
        endLineNumber: endLine ?? startLine,
        endColumn: editor.getModel()?.getLineMaxColumn(endLine ?? startLine) ?? 1,
      })
      editor.focus()
    }
    window.addEventListener('editor-navigate', handler)
    return () => window.removeEventListener('editor-navigate', handler)
  }, [])

  const fileIcon = file?.kind === 'image'
    ? 'lucide:image'
    : file?.kind === 'video'
      ? 'lucide:video'
      : file?.kind === 'audio'
        ? 'lucide:music'
      : 'lucide:file-code'

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center bg-[var(--bg)]">
        <Icon icon="lucide:code" width={48} height={48} className="text-[var(--text-tertiary)] mb-4" />
        <p className="text-[14px] font-medium text-[var(--text-secondary)]">No file open</p>
        <p className="text-[12px] text-[var(--text-tertiary)] mt-1 max-w-[280px]">
          Select a file from the explorer or use the agent to generate code
        </p>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {['/edit', '/explain', '/generate', '/search'].map(cmd => (
            <span key={cmd} className="text-[10px] font-mono px-2 py-1 rounded bg-[var(--bg-subtle)] border border-[var(--border)] text-[var(--text-tertiary)]">
              {cmd}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-0.5 px-3 py-1 border-b border-[var(--border)] bg-[var(--bg)] shrink-0 overflow-x-auto no-scrollbar">
        <Icon icon={fileIcon} width={12} height={12} className="text-[var(--text-tertiary)] shrink-0" />
        {file.path.split('/').map((segment, i, arr) => (
          <div key={i} className="flex items-center gap-0.5 shrink-0">
            {i > 0 && (
              <Icon icon="lucide:chevron-right" width={10} height={10} className="text-[var(--text-tertiary)]" />
            )}
            <button
              className={`text-[10px] font-mono px-1 py-0.5 rounded transition-colors cursor-pointer ${
                i === arr.length - 1
                  ? 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
              }`}
              onClick={() => {
                if (i < arr.length - 1) {
                  // Navigate to directory — dispatch search with prefix
                  const dirPath = arr.slice(0, i + 1).join('/')
                  window.dispatchEvent(new CustomEvent('quick-open-prefill', { detail: { query: dirPath + '/' } }))
                }
              }}
              title={arr.slice(0, i + 1).join('/')}
            >
              {segment}
            </button>
          </div>
        ))}
        {file.dirty && (
          <span className="text-[9px] text-[var(--brand)] font-medium ml-1 shrink-0">modified</span>
        )}
      </div>

      {/* ⌘K Inline Edit */}
      <InlineEdit
        visible={inlineEdit.visible}
        position={inlineEdit.position}
        selectedText={inlineEdit.selectedText}
        filePath={file.path}
        onSubmit={(instruction) => {
          // Dispatch to agent with selection context
          window.dispatchEvent(new CustomEvent('inline-edit-request', {
            detail: {
              filePath: file.path,
              instruction,
              selectedText: inlineEdit.selectedText,
              startLine: inlineEdit.startLine,
              endLine: inlineEdit.endLine,
            },
          }))
        }}
        onClose={() => setInlineEdit(prev => ({ ...prev, visible: false }))}
      />

      {/* Preview / Monaco */}
      <div className="flex-1 min-h-0">
        {file.kind === 'image' ? (
          <div className="h-full w-full flex items-center justify-center p-4 bg-[var(--bg-subtle)] overflow-auto">
            {file.content ? (
              <img
                src={file.content}
                alt={file.path.split('/').pop() ?? file.path}
                className="max-w-full max-h-full object-contain rounded border border-[var(--border)] bg-[var(--bg)]"
              />
            ) : (
              <div className="text-center text-[var(--text-tertiary)]">
                <p className="text-[12px]">Image preview unavailable</p>
              </div>
            )}
          </div>
        ) : file.kind === 'video' ? (
          <div className="h-full w-full flex items-center justify-center p-4 bg-[var(--bg-subtle)] overflow-auto">
            {file.content ? (
              <video
                src={file.content}
                controls
                className="max-w-full max-h-full rounded border border-[var(--border)] bg-black"
              />
            ) : (
              <div className="text-center text-[var(--text-tertiary)]">
                <p className="text-[12px]">Video preview unavailable</p>
              </div>
            )}
          </div>
        ) : file.kind === 'audio' ? (
          <div className="h-full w-full flex items-center justify-center p-4 bg-[var(--bg-subtle)] overflow-auto">
            {file.content ? (
              <div className="w-full max-w-[720px] rounded border border-[var(--border)] bg-[var(--bg)] p-4">
                <div className="flex items-center gap-2 mb-3 text-[var(--text-secondary)]">
                  <Icon icon="lucide:music-2" width={14} height={14} />
                  <span className="text-[12px] truncate">{file.path.split('/').pop() ?? file.path}</span>
                </div>
                <audio src={file.content} controls className="w-full" />
              </div>
            ) : (
              <div className="text-center text-[var(--text-tertiary)]">
                <p className="text-[12px]">Audio preview unavailable</p>
              </div>
            )}
          </div>
        ) : monacoReady ? (
          <Editor
            key={file.path}
            height="100%"
            defaultValue={file.content}
            language={file.language}
            theme="code-editor"
            onChange={handleChange}
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            options={{
              fontSize: 13,
              fontFamily: "'SF Mono', 'Fira Code', 'JetBrains Mono', Menlo, monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              bracketPairColorization: { enabled: true },
              guides: { indentation: true, bracketPairs: true },
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              tabSize: 2,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="h-full w-full bg-[var(--bg)]" />
        )}
      </div>
    </div>
  )
}
