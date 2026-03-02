'use client'

import { useState, useCallback, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useWorkflow, type WorkflowNode, type NodeKind } from '@/context/workflow-context'
import { nodeKindIcon } from './workflow-list'

const KIND_LABELS: Record<NodeKind, { label: string; description: string }> = {
  trigger: { label: 'Trigger', description: 'Entry point that starts the workflow' },
  agent: { label: 'Agent', description: 'AI agent that processes input and generates output' },
  tool: { label: 'Tool', description: 'Executes a specific tool or command' },
  condition: { label: 'Condition', description: 'Routes execution based on evaluation' },
  transform: { label: 'Transform', description: 'Transforms data with a JS expression' },
  output: { label: 'Output', description: 'Terminal node that records final result' },
  human: { label: 'Human', description: 'Pauses for human approval before continuing' },
  loop: { label: 'Loop', description: 'Repeats connected nodes' },
}

const MODEL_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'anthropic/claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'anthropic/claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
  { value: 'anthropic/claude-haiku-3.5', label: 'Claude Haiku 3.5' },
  { value: 'openai/gpt-4.1', label: 'GPT-4.1' },
  { value: 'openai/o3', label: 'o3' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
]

interface Props {
  node: WorkflowNode
  workflowId: string
}

export function NodeInspector({ node, workflowId }: Props) {
  const { updateNodeConfig, removeNode, setSelectedNodeId } = useWorkflow()
  const kind = KIND_LABELS[node.kind]

  const updateConfig = useCallback((key: string, value: unknown) => {
    updateNodeConfig(workflowId, node.id, { [key]: value })
  }, [workflowId, node.id, updateNodeConfig])

  const statusLabel = node.status === 'idle' ? 'Ready' : node.status === 'running' ? 'Running' : node.status === 'success' ? 'Completed' : node.status === 'error' ? 'Failed' : node.status === 'waiting' ? 'Awaiting Approval' : node.status === 'skipped' ? 'Skipped' : node.status

  return (
    <div className="w-[280px] border-l border-[var(--border)] bg-[var(--bg-elevated)] overflow-y-auto shrink-0">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--bg-subtle)]">
              <Icon icon={nodeKindIcon(node.kind)} width={12} height={12} className="text-[var(--brand)]" />
            </div>
            <span className="text-[12px] font-semibold text-[var(--text-primary)]">{node.label}</span>
          </div>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1 rounded hover:bg-[var(--bg-subtle)] text-[var(--text-disabled)] cursor-pointer"
          >
            <Icon icon="lucide:x" width={12} height={12} />
          </button>
        </div>
        <div className="flex items-center gap-2 ml-8">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-tertiary)] font-medium">{kind.label}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
            node.status === 'success' ? 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]' :
            node.status === 'error' ? 'bg-[color-mix(in_srgb,var(--error)_12%,transparent)] text-[var(--error)]' :
            node.status === 'running' ? 'bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-[var(--brand)]' :
            'bg-[var(--bg-subtle)] text-[var(--text-disabled)]'
          }`}>{statusLabel}</span>
        </div>
        <p className="text-[10px] text-[var(--text-disabled)] mt-1 ml-8">{kind.description}</p>
      </div>

      {/* Configuration */}
      <div className="px-3 py-2.5 space-y-3">
        <SectionLabel>Configuration</SectionLabel>

        {/* Label */}
        <Field label="Label">
          <input
            value={node.label}
            onChange={(e) => {
              // Label is stored on node directly, not in config
              // For now we use config.label as a display override
              updateConfig('_label', e.target.value)
            }}
            className="input-field"
            placeholder="Node name"
          />
        </Field>

        {/* Agent-specific config */}
        {node.kind === 'agent' && (
          <>
            <Field label="Model">
              <select
                value={(node.config.model as string) || ''}
                onChange={(e) => updateConfig('model', e.target.value || undefined)}
                className="input-field"
              >
                {MODEL_OPTIONS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>
            <Field label="System Prompt">
              <textarea
                value={(node.config.systemPrompt as string) || ''}
                onChange={(e) => updateConfig('systemPrompt', e.target.value)}
                className="input-field min-h-[60px] resize-y"
                placeholder="Optional system instructions..."
                rows={3}
              />
            </Field>
            <Field label="Prompt">
              <textarea
                value={(node.config.prompt as string) || ''}
                onChange={(e) => updateConfig('prompt', e.target.value)}
                className="input-field min-h-[80px] resize-y"
                placeholder="What should this agent do?"
                rows={4}
              />
            </Field>
          </>
        )}

        {/* Tool-specific config */}
        {node.kind === 'tool' && (
          <>
            <Field label="Tool">
              <select
                value={(node.config.tool as string) || 'exec'}
                onChange={(e) => updateConfig('tool', e.target.value)}
                className="input-field"
              >
                <option value="exec">Shell Command</option>
                <option value="gh">GitHub CLI</option>
                <option value="read">Read File</option>
                <option value="web_search">Web Search</option>
                <option value="web_fetch">Fetch URL</option>
              </select>
            </Field>
            <Field label="Command / Args">
              <textarea
                value={(node.config.command as string) || ''}
                onChange={(e) => updateConfig('command', e.target.value)}
                className="input-field min-h-[60px] resize-y font-mono text-[10px]"
                placeholder="e.g. gh pr list --json number,title"
                rows={3}
              />
            </Field>
          </>
        )}

        {/* Trigger config */}
        {node.kind === 'trigger' && (
          <Field label="Event">
            <select
              value={(node.config.event as string) || 'manual'}
              onChange={(e) => updateConfig('event', e.target.value)}
              className="input-field"
            >
              <option value="manual">Manual Trigger</option>
              <option value="pull_request.opened">PR Opened</option>
              <option value="pull_request.updated">PR Updated</option>
              <option value="issues.opened">Issue Opened</option>
              <option value="push">Push to Branch</option>
              <option value="schedule">Schedule / Cron</option>
            </select>
          </Field>
        )}

        {/* Condition config */}
        {node.kind === 'condition' && (
          <Field label="Condition">
            <textarea
              value={(node.config.condition as string) || ''}
              onChange={(e) => updateConfig('condition', e.target.value)}
              className="input-field min-h-[60px] resize-y"
              placeholder="Describe what to evaluate (AI interprets this)"
              rows={3}
            />
          </Field>
        )}

        {/* Transform config */}
        {node.kind === 'transform' && (
          <Field label="Expression">
            <textarea
              value={(node.config.expression as string) || ''}
              onChange={(e) => updateConfig('expression', e.target.value)}
              className="input-field min-h-[60px] resize-y font-mono text-[10px]"
              placeholder="JavaScript expression, e.g. input.filter(x => x.status === 'open')"
              rows={3}
            />
          </Field>
        )}

        {/* Position */}
        <SectionLabel>Position</SectionLabel>
        <div className="flex gap-2">
          <Field label="X">
            <input type="number" value={node.x} readOnly className="input-field font-mono text-[10px] w-full" />
          </Field>
          <Field label="Y">
            <input type="number" value={node.y} readOnly className="input-field font-mono text-[10px] w-full" />
          </Field>
        </div>

        {/* Stats (when available) */}
        {(node.duration || node.tokens) && (
          <>
            <SectionLabel>Last Run</SectionLabel>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {node.duration != null && (
                <div>
                  <span className="text-[var(--text-disabled)] block">Duration</span>
                  <span className="font-mono text-[var(--text-secondary)]">{(node.duration / 1000).toFixed(1)}s</span>
                </div>
              )}
              {node.tokens && (
                <>
                  <div>
                    <span className="text-[var(--text-disabled)] block">Input</span>
                    <span className="font-mono text-[var(--text-secondary)]">{node.tokens.input.toLocaleString()} tok</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-disabled)] block">Output</span>
                    <span className="font-mono text-[var(--text-secondary)]">{node.tokens.output.toLocaleString()} tok</span>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Error display */}
        {node.status === 'error' && node.error && (
          <>
            <SectionLabel>Error</SectionLabel>
            <div className="p-2 rounded-lg bg-[color-mix(in_srgb,var(--error)_6%,transparent)] border border-[color-mix(in_srgb,var(--error)_20%,transparent)] text-[10px] font-mono text-[var(--error)]">
              {node.error}
            </div>
          </>
        )}

        {/* Danger zone */}
        <div className="pt-2 border-t border-[var(--border)]">
          <button
            onClick={() => { removeNode(workflowId, node.id); setSelectedNodeId(null) }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)] cursor-pointer w-full"
          >
            <Icon icon="lucide:trash-2" width={11} height={11} />
            Delete Node
          </button>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 4px 8px;
          font-size: 11px;
          border-radius: 6px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: var(--border-focus);
        }
        .input-field::placeholder {
          color: var(--text-disabled);
        }
      `}</style>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] uppercase tracking-wider font-medium text-[var(--text-disabled)] block">
      {children}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] text-[var(--text-tertiary)] block mb-0.5">{label}</label>
      {children}
    </div>
  )
}
