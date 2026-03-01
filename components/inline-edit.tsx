'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Icon } from '@iconify/react'

/**
 * ⌘K Inline Edit — Cursor-style inline edit prompt.
 * Appears at the cursor/selection position in the editor.
 * User types instruction → dispatches to agent for processing.
 */

interface InlineEditProps {
  visible: boolean
  position: { top: number; left: number }
  selectedText: string
  filePath: string
  onSubmit: (instruction: string) => void
  onClose: () => void
}

export function InlineEdit({ visible, position, selectedText, filePath, onSubmit, onClose }: InlineEditProps) {
  const [instruction, setInstruction] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (visible) {
      setInstruction('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [visible])

  const handleSubmit = useCallback(() => {
    if (!instruction.trim()) return
    onSubmit(instruction.trim())
    setInstruction('')
    onClose()
  }, [instruction, onSubmit, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [handleSubmit, onClose])

  if (!visible) return null

  const previewText = selectedText.length > 60
    ? selectedText.slice(0, 60) + '...'
    : selectedText

  return (
    <div
      className="fixed z-50 w-[400px] rounded-lg border border-[var(--brand)] bg-[var(--bg-elevated)] shadow-2xl overflow-hidden"
      style={{
        top: Math.max(8, position.top),
        left: Math.max(8, Math.min(position.left, (typeof window !== 'undefined' ? window.innerWidth : 800) - 420)),
      }}
    >
      {/* Header showing selected context */}
      {selectedText && (
        <div className="px-3 py-1.5 border-b border-[var(--border)] bg-[var(--bg-subtle)]">
          <div className="flex items-center gap-1.5">
            <Icon icon="lucide:text-cursor-input" width={11} height={11} className="text-[var(--brand)] shrink-0" />
            <span className="text-[10px] text-[var(--text-tertiary)] truncate font-mono">{previewText}</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2">
        <Icon icon="lucide:sparkles" width={14} height={14} className="text-[var(--brand)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={instruction}
          onChange={e => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Edit instruction..."
          className="flex-1 bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!instruction.trim()}
          className="p-1 rounded text-[var(--brand)] disabled:opacity-25 cursor-pointer transition-opacity"
        >
          <Icon icon="lucide:arrow-right" width={14} height={14} />
        </button>
      </div>

      {/* Hint */}
      <div className="px-3 pb-1.5 flex items-center gap-2">
        <span className="text-[9px] text-[var(--text-tertiary)]">
          <kbd className="px-1 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border)] font-mono">Enter</kbd> submit
        </span>
        <span className="text-[9px] text-[var(--text-tertiary)]">
          <kbd className="px-1 py-0.5 rounded bg-[var(--bg-subtle)] border border-[var(--border)] font-mono">Esc</kbd> cancel
        </span>
      </div>
    </div>
  )
}
