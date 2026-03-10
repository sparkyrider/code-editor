'use client'

import { useCallback, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { cn } from '@/lib/utils'
import { emit } from '@/lib/events'
import { useView } from '@/context/view-context'
import { PROMPT_CATALOG, searchPrompts } from '@/lib/prompts/catalog'
import {
  PROMPT_CATEGORY_ICONS,
  PROMPT_CATEGORY_LABELS,
  type PromptCategory,
  type PromptSpeed,
  type PromptTemplate,
  type PromptVariable,
} from '@/lib/prompts/types'

// ── Filter definitions ────────────────────────────────────────

const CATEGORY_FILTERS: Array<{ id: 'all' | PromptCategory; label: string }> = [
  { id: 'all', label: 'All' },
  ...Object.entries(PROMPT_CATEGORY_LABELS).map(([id, label]) => ({
    id: id as PromptCategory,
    label,
  })),
]

const SPEED_FILTERS: Array<{ id: 'all' | PromptSpeed; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'instant', label: 'Instant' },
  { id: 'step-by-step', label: 'Step-by-Step' },
]

// ── Search field ──────────────────────────────────────────────

function SearchField({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-w-[220px] items-center gap-3 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-4 py-3 shadow-[var(--shadow-xs)] backdrop-blur',
        className,
      )}
    >
      <Icon
        icon="lucide:search"
        width={16}
        height={16}
        className="shrink-0 text-[var(--text-disabled)]"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="shrink-0 text-[var(--text-disabled)] hover:text-[var(--text-secondary)]"
        >
          <Icon icon="lucide:x" width={14} height={14} />
        </button>
      )}
    </div>
  )
}

// ── Variable composer ─────────────────────────────────────────

function VariableComposer({
  prompt,
  onSend,
  onCancel,
}: {
  prompt: PromptTemplate
  onSend: (text: string) => void
  onCancel: () => void
}) {
  const vars = prompt.variables ?? []
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(vars.map((v) => [v.name, ''])),
  )

  const resolved = useMemo(() => {
    let text = prompt.prompt
    for (const v of vars) {
      text = text.replaceAll(`{{${v.name}}}`, values[v.name] || v.placeholder)
    }
    return text
  }, [prompt.prompt, vars, values])

  const allFilled = vars.every((v) => values[v.name]?.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-lg)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] text-[var(--brand)]">
              <Icon icon={prompt.icon} width={18} height={18} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                {prompt.title}
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)]">Fill in the details below</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-[var(--text-disabled)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-secondary)]"
          >
            <Icon icon="lucide:x" width={16} height={16} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {vars.map((v) => (
            <div key={v.name}>
              <label className="mb-1.5 block text-[12px] font-medium text-[var(--text-secondary)]">
                {v.label}
              </label>
              <input
                type="text"
                value={values[v.name]}
                onChange={(e) => setValues((prev) => ({ ...prev, [v.name]: e.target.value }))}
                placeholder={v.placeholder}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)] focus:border-[var(--brand)]"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-disabled)]">
            Preview
          </div>
          <p className="line-clamp-4 text-[12px] leading-5 text-[var(--text-secondary)]">
            {resolved}
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSend(resolved)}
            disabled={!allFilled}
            className={cn(
              'rounded-full px-5 py-2 text-[12px] font-semibold transition',
              allFilled
                ? 'bg-[var(--brand)] text-[var(--brand-contrast)] hover:opacity-90'
                : 'bg-[var(--bg-subtle)] text-[var(--text-disabled)] cursor-not-allowed',
            )}
          >
            <span className="flex items-center gap-1.5">
              <Icon icon="lucide:send" width={12} height={12} />
              Send to Chat
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Prompt card ───────────────────────────────────────────────

function PromptCard({
  prompt,
  onUse,
}: {
  prompt: PromptTemplate
  onUse: (prompt: PromptTemplate) => void
}) {
  const categoryLabel = PROMPT_CATEGORY_LABELS[prompt.category]
  const categoryIcon = PROMPT_CATEGORY_ICONS[prompt.category]

  return (
    <article className="group rounded-[22px] border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--bg-elevated)_92%,transparent),color-mix(in_srgb,var(--bg)_92%,transparent))] p-3.5 shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--brand)_35%,var(--border))] hover:shadow-[var(--shadow-md)] sm:rounded-[26px] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--brand)_24%,var(--border))] bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] text-[var(--brand)]">
            <Icon icon={prompt.icon} width={18} height={18} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
                  prompt.speed === 'instant'
                    ? 'border-[color-mix(in_srgb,var(--color-additions,#22c55e)_30%,var(--border))] bg-[color-mix(in_srgb,var(--color-additions,#22c55e)_10%,transparent)] text-[var(--color-additions,#22c55e)]'
                    : 'border-[color-mix(in_srgb,#8b5cf6_30%,var(--border))] bg-[color-mix(in_srgb,#8b5cf6_10%,transparent)] text-[#8b5cf6]',
                )}
              >
                {prompt.speed === 'instant' ? 'Instant' : 'Step-by-Step'}
              </span>
            </div>
            <h3 className="mt-2.5 text-[15px] font-semibold leading-5 text-[var(--text-primary)]">
              {prompt.title}
            </h3>
          </div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
        {prompt.description}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {prompt.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[color-mix(in_srgb,var(--text-primary)_7%,transparent)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-tertiary)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] px-3 py-2">
        <Icon
          icon={categoryIcon}
          width={13}
          height={13}
          className="shrink-0 text-[var(--text-disabled)]"
        />
        <span className="truncate text-[12px] text-[var(--text-secondary)]">{categoryLabel}</span>
      </div>

      {prompt.variables && prompt.variables.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {prompt.variables.map((v: PromptVariable) => (
            <span
              key={v.name}
              className="rounded-full border border-dashed border-[var(--border)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-disabled)]"
            >
              {`{{${v.name}}}`}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => onUse(prompt)}
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-3.5 py-2 text-[11px] font-semibold text-[var(--brand-contrast)] transition hover:opacity-90"
        >
          <Icon icon="lucide:play" width={12} height={12} />
          Use
        </button>
      </div>
    </article>
  )
}

// ── Main component ────────────────────────────────────────────

interface PromptLibraryProps {
  variant?: 'page' | 'settings'
}

export function PromptLibrary({ variant = 'page' }: PromptLibraryProps) {
  const { setView } = useView()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | PromptCategory>('all')
  const [activeSpeed, setActiveSpeed] = useState<'all' | PromptSpeed>('all')
  const [composerPrompt, setComposerPrompt] = useState<PromptTemplate | null>(null)

  const filteredPrompts = useMemo(() => {
    let results = search ? searchPrompts(search) : PROMPT_CATALOG
    if (activeCategory !== 'all') {
      results = results.filter((p) => p.category === activeCategory)
    }
    if (activeSpeed !== 'all') {
      results = results.filter((p) => p.speed === activeSpeed)
    }
    return results
  }, [search, activeCategory, activeSpeed])

  const handleUse = useCallback(
    (p: PromptTemplate) => {
      if (p.variables && p.variables.length > 0) {
        setComposerPrompt(p)
      } else {
        emit('prompt-use', { text: p.prompt })
        setView('chat')
      }
    },
    [setView],
  )

  const handleComposerSend = useCallback(
    (text: string) => {
      setComposerPrompt(null)
      emit('prompt-use', { text })
      setView('chat')
    },
    [setView],
  )

  const isPage = variant === 'page'

  return (
    <>
      <div className={cn('flex flex-col gap-6', isPage ? 'p-6 sm:p-8' : 'p-4')}>
        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:book-open" width={22} height={22} className="text-[var(--brand)]" />
            <h1 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
              Prompt Library
            </h1>
            <span className="rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--brand)_8%,transparent)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--brand)]">
              {PROMPT_CATALOG.length} prompts
            </span>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Curated prompt templates for common development tasks. Click &quot;Use&quot; to send
            directly to the agent.
          </p>
        </div>

        {/* Search + speed filter */}
        <div className="flex flex-wrap items-center gap-3">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search prompts..."
            className="flex-1"
          />
          <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] p-1">
            {SPEED_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveSpeed(f.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-medium transition',
                  activeSpeed === f.id
                    ? 'bg-[var(--brand)] text-[var(--brand-contrast)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveCategory(f.id)}
              className={cn(
                'rounded-full border px-3.5 py-2 text-[11px] font-medium transition',
                activeCategory === f.id
                  ? 'border-[color-mix(in_srgb,var(--brand)_34%,var(--border))] bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] text-[var(--brand)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-disabled)] hover:text-[var(--text-primary)]',
              )}
            >
              {f.id !== 'all' && (
                <Icon
                  icon={PROMPT_CATEGORY_ICONS[f.id as PromptCategory]}
                  width={12}
                  height={12}
                  className="mr-1.5 inline-block align-[-2px]"
                />
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-[12px] text-[var(--text-disabled)]">
          {filteredPrompts.length === PROMPT_CATALOG.length
            ? `Showing all ${PROMPT_CATALOG.length} prompts`
            : `${filteredPrompts.length} of ${PROMPT_CATALOG.length} prompts`}
        </div>

        {/* Prompt grid */}
        {filteredPrompts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPrompts.map((p) => (
              <PromptCard key={p.id} prompt={p} onUse={handleUse} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Icon
              icon="lucide:search-x"
              width={40}
              height={40}
              className="text-[var(--text-disabled)]"
            />
            <p className="text-[14px] text-[var(--text-secondary)]">
              No prompts match your filters
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveCategory('all')
                setActiveSpeed('all')
              }}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-[12px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Variable composer modal */}
      {composerPrompt && (
        <VariableComposer
          prompt={composerPrompt}
          onSend={handleComposerSend}
          onCancel={() => setComposerPrompt(null)}
        />
      )}
    </>
  )
}
