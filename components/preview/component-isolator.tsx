'use client'

import { useEffect } from 'react'
import { Icon } from '@iconify/react'
import { usePreview } from '@/context/preview-context'
import { useEditor } from '@/context/editor-context'
import { useView } from '@/context/view-context'

export function ComponentIsolatorListener() {
  const { isolateComponent } = usePreview()
  const { activeFile } = useEditor()
  const { setView } = useView()

  useEffect(() => {
    const handler = () => {
      if (!activeFile) return
      const name = activeFile.split('/').pop()?.replace(/\.\w+$/, '') ?? 'Component'
      isolateComponent({ name, filePath: activeFile, props: {} })
      setView('preview')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener('preview-isolate-component', handler)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('preview-isolate-component', handler)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeFile, isolateComponent, setView])

  return null
}

export function ComponentIsolator() {
  const { isolatedComponent, exitIsolation } = usePreview()

  if (!isolatedComponent) return null

  const hasProps = Object.keys(isolatedComponent.props).length > 0

  return (
    <div className="w-full h-full flex flex-col">
      {/* Isolated render area */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-6 overflow-auto bg-[repeating-conic-gradient(var(--bg-subtle)_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]">
        {isolatedComponent.code ? (
          <div className="w-full max-w-2xl bg-[var(--bg)] rounded-xl border border-[var(--border)] shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <Icon icon="lucide:code" width={12} height={12} className="text-[var(--text-disabled)]" />
              <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{isolatedComponent.filePath}</span>
            </div>
            <pre className="text-[11px] font-mono text-[var(--text-secondary)] whitespace-pre-wrap p-4 overflow-auto max-h-full">
              {isolatedComponent.code}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center bg-[var(--bg)] rounded-xl border border-[var(--border)] shadow-lg p-8 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] flex items-center justify-center">
              <Icon icon="lucide:component" width={28} height={28} className="text-[var(--brand)]" />
            </div>

            <div className="space-y-1">
              <p className="text-[14px] font-semibold text-[var(--text-primary)]">{isolatedComponent.name}</p>
              <p className="text-[11px] font-mono text-[var(--text-disabled)]">{isolatedComponent.filePath}</p>
            </div>

            {hasProps && (
              <div className="w-full text-left">
                <p className="text-[9px] uppercase tracking-wider font-semibold text-[var(--text-disabled)] mb-1.5">Props</p>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-2.5 font-mono text-[10px] space-y-0.5">
                  {Object.entries(isolatedComponent.props).map(([key, val]) => (
                    <div key={key} className="flex gap-2 items-baseline">
                      <span className="text-[var(--brand)] font-medium">{key}</span>
                      <span className="text-[var(--text-disabled)]">=</span>
                      <span className="text-[var(--text-tertiary)] truncate">{JSON.stringify(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] text-[var(--text-disabled)] leading-relaxed max-w-[240px]">
              This component is rendered in isolation. Use the toolbar above to exit back to the full preview.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
