'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
type Priority = 'P0' | 'P1' | 'P2' | 'P3'
type LabelId = 'bug' | 'feature' | 'docs' | 'refactor' | 'urgent'
type ColumnId = 'backlog' | 'in-progress' | 'review' | 'done'

interface Label {
  id: LabelId | string
  name: string
  color: string
}

interface KanbanCard {
  id: string
  title: string
  description?: string
  labels: string[]
  priority: Priority
  assignee?: string
  createdAt: number
  columnId: ColumnId
}

interface KanbanColumn {
  id: ColumnId
  title: string
  icon: string
  color: string
  collapsed: boolean
}

interface KanbanBoard {
  id: string
  name: string
  cards: KanbanCard[]
  columns: KanbanColumn[]
  labels: Label[]
}

interface KanbanData {
  boards: KanbanBoard[]
  activeBoard: string
}

const STORAGE_KEY = 'knot-code:kanban:boards'

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', title: '📥 Backlog', icon: 'lucide:inbox', color: 'gray', collapsed: false },
  { id: 'in-progress', title: '🔄 In Progress', icon: 'lucide:play', color: 'blue', collapsed: false },
  { id: 'review', title: '👀 Review', icon: 'lucide:eye', color: 'amber', collapsed: false },
  { id: 'done', title: '✅ Done', icon: 'lucide:check', color: 'green', collapsed: false },
]

const DEFAULT_LABELS: Label[] = [
  { id: 'bug', name: 'Bug', color: '#ef4444' },
  { id: 'feature', name: 'Feature', color: '#3b82f6' },
  { id: 'docs', name: 'Docs', color: '#22c55e' },
  { id: 'refactor', name: 'Refactor', color: '#a855f7' },
  { id: 'urgent', name: 'Urgent', color: '#f97316' },
]

const PRIORITY_CONFIG = {
  P0: { label: 'Critical', color: '#ef4444' },
  P1: { label: 'High', color: '#f97316' },
  P2: { label: 'Medium', color: '#eab308' },
  P3: { label: 'Low', color: '#6b7280' },
}

function loadKanbanData(): KanbanData {
  if (typeof window === 'undefined') {
    return {
      boards: [
        {
          id: 'default',
          name: 'Project Tasks',
          cards: [],
          columns: DEFAULT_COLUMNS,
          labels: DEFAULT_LABELS,
        },
      ],
      activeBoard: 'default',
    }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {}
  return {
    boards: [
      {
        id: 'default',
        name: 'Project Tasks',
        cards: [],
        columns: DEFAULT_COLUMNS,
        labels: DEFAULT_LABELS,
      },
    ],
    activeBoard: 'default',
  }
}

function saveKanbanData(data: KanbanData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function KanbanView() {
  const [data, setData] = useState<KanbanData>(loadKanbanData)
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<ColumnId | null>(null)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [newCardColumn, setNewCardColumn] = useState<ColumnId | null>(null)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLabel, setFilterLabel] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<Priority | null>(null)

  useEffect(() => {
    saveKanbanData(data)
  }, [data])

  const activeBoard = useMemo(() => {
    return data.boards.find((b) => b.id === data.activeBoard) || data.boards[0]
  }, [data])

  const filteredCards = useMemo(() => {
    let cards = activeBoard.cards
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      cards = cards.filter(
        (card) =>
          card.title.toLowerCase().includes(query) ||
          card.description?.toLowerCase().includes(query),
      )
    }
    if (filterLabel) {
      cards = cards.filter((card) => card.labels.includes(filterLabel))
    }
    if (filterPriority) {
      cards = cards.filter((card) => card.priority === filterPriority)
    }
    return cards
  }, [activeBoard.cards, searchQuery, filterLabel, filterPriority])

  const getColumnCards = useCallback(
    (columnId: ColumnId) => {
      return filteredCards.filter((card) => card.columnId === columnId)
    },
    [filteredCards],
  )

  const addCard = useCallback(
    (columnId: ColumnId, title: string) => {
      if (!title.trim()) return
      const newCard: KanbanCard = {
        id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: title.trim(),
        labels: [],
        priority: 'P2',
        createdAt: Date.now(),
        columnId,
      }
      setData((prev) => ({
        ...prev,
        boards: prev.boards.map((board) =>
          board.id === prev.activeBoard
            ? { ...board, cards: [...board.cards, newCard] }
            : board,
        ),
      }))
      setNewCardColumn(null)
      setNewCardTitle('')
    },
    [],
  )

  const moveCard = useCallback((cardId: string, toColumnId: ColumnId) => {
    setData((prev) => ({
      ...prev,
      boards: prev.boards.map((board) =>
        board.id === prev.activeBoard
          ? {
              ...board,
              cards: board.cards.map((card) =>
                card.id === cardId ? { ...card, columnId: toColumnId } : card,
              ),
            }
          : board,
      ),
    }))
  }, [])

  const deleteCard = useCallback((cardId: string) => {
    setData((prev) => ({
      ...prev,
      boards: prev.boards.map((board) =>
        board.id === prev.activeBoard
          ? { ...board, cards: board.cards.filter((card) => card.id !== cardId) }
          : board,
      ),
    }))
  }, [])

  const updateCard = useCallback(
    (cardId: string, updates: Partial<KanbanCard>) => {
      setData((prev) => ({
        ...prev,
        boards: prev.boards.map((board) =>
          board.id === prev.activeBoard
            ? {
                ...board,
                cards: board.cards.map((card) =>
                  card.id === cardId ? { ...card, ...updates } : card,
                ),
              }
            : board,
        ),
      }))
    },
    [],
  )

  const toggleColumn = useCallback((columnId: ColumnId) => {
    setData((prev) => ({
      ...prev,
      boards: prev.boards.map((board) =>
        board.id === prev.activeBoard
          ? {
              ...board,
              columns: board.columns.map((col) =>
                col.id === columnId ? { ...col, collapsed: !col.collapsed } : col,
              ),
            }
          : board,
      ),
    }))
  }, [])

  const createBoard = useCallback(() => {
    const newBoard: KanbanBoard = {
      id: `board-${Date.now()}`,
      name: 'New Board',
      cards: [],
      columns: DEFAULT_COLUMNS,
      labels: DEFAULT_LABELS,
    }
    setData((prev) => ({
      boards: [...prev.boards, newBoard],
      activeBoard: newBoard.id,
    }))
  }, [])

  const handleDragStart = useCallback((card: KanbanCard) => {
    setDraggedCard(card)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault()
    setDraggedOverColumn(columnId)
  }, [])

  const handleDrop = useCallback(
    (columnId: ColumnId) => {
      if (draggedCard) {
        moveCard(draggedCard.id, columnId)
        setDraggedCard(null)
        setDraggedOverColumn(null)
      }
    },
    [draggedCard, moveCard],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null)
    setDraggedOverColumn(null)
  }, [])

  const getLabelById = useCallback(
    (labelId: string) => {
      return activeBoard.labels.find((l) => l.id === labelId)
    },
    [activeBoard.labels],
  )

  return (
    <div className="h-full w-full flex flex-col min-h-0 bg-[var(--sidebar-bg)]">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon icon="lucide:kanban" width={24} height={24} className="text-[var(--brand)]" />
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">
              {activeBoard.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createBoard}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand)]"
            >
              <Icon icon="lucide:plus" width={16} height={16} />
              New Board
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Icon
              icon="lucide:search"
              width={16}
              height={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)]"
            />
          </div>
          <select
            value={filterPriority || ''}
            onChange={(e) => setFilterPriority((e.target.value as Priority) || null)}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)]"
          >
            <option value="">All Priorities</option>
            {Object.keys(PRIORITY_CONFIG).map((p) => (
              <option key={p} value={p}>
                {p} - {PRIORITY_CONFIG[p as Priority].label}
              </option>
            ))}
          </select>
          <select
            value={filterLabel || ''}
            onChange={(e) => setFilterLabel(e.target.value || null)}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)]"
          >
            <option value="">All Labels</option>
            {activeBoard.labels.map((label) => (
              <option key={label.id} value={label.id}>
                {label.name}
              </option>
            ))}
          </select>
          {(searchQuery || filterLabel || filterPriority) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterLabel(null)
                setFilterPriority(null)
              }}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0 px-6 py-6">
        <div className="flex gap-4 h-full min-w-max">
          {activeBoard.columns.map((column) => {
            const cards = getColumnCards(column.id)
            const isCollapsed = column.collapsed
            const isDraggedOver = draggedOverColumn === column.id

            return (
              <div
                key={column.id}
                className="flex flex-col w-80 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] transition"
                style={{
                  minHeight: isCollapsed ? 'auto' : '500px',
                  boxShadow: isDraggedOver ? '0 0 0 2px var(--brand)' : undefined,
                }}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <button
                  onClick={() => toggleColumn(column.id)}
                  className="flex items-center justify-between gap-2 px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-[var(--text-primary)]">
                      {column.title}
                    </span>
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[var(--bg)] px-2 text-xs font-bold text-[var(--text-secondary)]">
                      {cards.length}
                    </span>
                  </div>
                  <Icon
                    icon={isCollapsed ? 'lucide:chevron-right' : 'lucide:chevron-down'}
                    width={16}
                    height={16}
                    className="text-[var(--text-disabled)]"
                  />
                </button>

                {!isCollapsed && (
                  <>
                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                      <AnimatePresence>
                        {cards.map((card) => (
                          <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            draggable
                            onDragStart={() => handleDragStart(card)}
                            onDragEnd={handleDragEnd}
                            className="group relative rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 cursor-move transition hover:border-[var(--brand)]/60 hover:shadow-sm"
                            style={{
                              borderLeftColor: PRIORITY_CONFIG[card.priority].color,
                              borderLeftWidth: '3px',
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-medium text-[var(--text-primary)] break-words flex-1">
                                {card.title}
                              </h3>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => setEditingCard(card.id)}
                                  className="rounded p-1 text-[var(--text-disabled)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                                >
                                  <Icon icon="lucide:edit-2" width={12} height={12} />
                                </button>
                                <button
                                  onClick={() => deleteCard(card.id)}
                                  className="rounded p-1 text-[var(--text-disabled)] hover:bg-[var(--bg-elevated)] hover:text-[var(--destructive)]"
                                >
                                  <Icon icon="lucide:trash-2" width={12} height={12} />
                                </button>
                              </div>
                            </div>

                            {card.description && (
                              <p className="mt-2 text-xs text-[var(--text-secondary)] line-clamp-2">
                                {card.description}
                              </p>
                            )}

                            {card.labels.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {card.labels.map((labelId) => {
                                  const label = getLabelById(labelId)
                                  if (!label) return null
                                  return (
                                    <span
                                      key={labelId}
                                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                                      style={{ backgroundColor: label.color }}
                                    >
                                      {label.name}
                                    </span>
                                  )
                                })}
                              </div>
                            )}

                            <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--text-disabled)]">
                              <span>{PRIORITY_CONFIG[card.priority].label}</span>
                              <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {newCardColumn === column.id && (
                        <div className="rounded-xl border border-[var(--brand)] bg-[var(--bg)] p-3">
                          <input
                            autoFocus
                            type="text"
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addCard(column.id, newCardTitle)
                              } else if (e.key === 'Escape') {
                                setNewCardColumn(null)
                                setNewCardTitle('')
                              }
                            }}
                            placeholder="Card title..."
                            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => addCard(column.id, newCardTitle)}
                              className="rounded-lg bg-[var(--brand)] px-3 py-1 text-xs font-medium text-white transition hover:opacity-90"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setNewCardColumn(null)
                                setNewCardTitle('')
                              }}
                              className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Add Card Button */}
                    {newCardColumn !== column.id && (
                      <button
                        onClick={() => setNewCardColumn(column.id)}
                        className="mx-3 mb-3 flex items-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--brand)] hover:text-[var(--text-primary)]"
                      >
                        <Icon icon="lucide:plus" width={16} height={16} />
                        Add card
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
