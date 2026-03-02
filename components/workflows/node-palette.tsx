'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useWorkflow, type NodeKind } from '@/context/workflow-context'
import { nodeKindIcon } from './workflow-list'

const NODE_TYPES: { kind: NodeKind; label: string; description: string }[] = [
  { kind: 'trigger', label: 'Trigger', description: 'Start the workflow' },
  { kind: 'agent', label: 'Agent', description: 'AI model call' },
  { kind: 'tool', label: 'Tool', description: 'Run a tool/command' },
  { kind: 'condition', label: 'Condition', description: 'Branch logic' },
  { kind: 'transform', label: 'Transform', description: 'Process data' },
  { kind: 'human', label: 'Human', description: 'Require approval' },
  { kind: 'output', label: 'Output', description: 'End node' },
  { kind: 'loop', label: 'Loop', description: 'Repeat nodes' },
]

export function NodePalette() {
  const { activeWorkflow, addNode } = useWorkflow()
  const [open, setOpen] = useState(false)

  if (!activeWorkflow) return null

  const handleAdd = (kind: NodeKind, label: string) => {
    // Place new node offset from existing nodes
    const maxX = activeWorkflow.nodes.length > 0 ? Math.max(...activeWorkflow.nodes.map(n => n.x)) : 40
    const maxY = activeWorkflow.nodes.length > 0 ? Math.max(...activeWorkflow.nodes.map(n => n.y)) : 140
    addNode(activeWorkflow.id, {
      kind,
      label,
      description: '',
      x: maxX + 180,
      y: maxY,
      config: kind === 'agent' ? { model: '', prompt: label } : kind === 'tool' ? { tool: 'exec' } : kind === 'trigger' ? { event: 'manual' } : {},
    })
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer border border-[var(--border)]"
      >
        <Icon icon="lucide:plus" width={10} height={10} />
        Add Node
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-40 w-[200px] rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] overflow-hidden animate-in slide-in-from-top-1">
            <div className="p-1">
              {NODE_TYPES.map(nt => (
                <button
                  key={nt.kind}
                  onClick={() => handleAdd(nt.kind, nt.label)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer text-left"
                >
                  <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--bg-subtle)]">
                    <Icon icon={nodeKindIcon(nt.kind)} width={12} height={12} className="text-[var(--brand)]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-[var(--text-primary)] block">{nt.label}</span>
                    <span className="text-[9px] text-[var(--text-disabled)]">{nt.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
