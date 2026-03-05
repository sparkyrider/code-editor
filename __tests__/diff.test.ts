import { describe, it, expect } from 'vitest'
import { computeDiff, countChanges } from '@/lib/diff'

describe('computeDiff', () => {
  it('returns context lines for identical content', () => {
    const text = 'line 1\nline 2\nline 3'
    const result = computeDiff(text, text)
    expect(result.every(l => l.type === 'context')).toBe(true)
    expect(result).toHaveLength(3)
  })

  it('returns empty context for two empty strings', () => {
    const result = computeDiff('', '')
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('context')
    expect(result[0].content).toBe('')
  })

  it('detects added lines', () => {
    const result = computeDiff('a', 'a\nb\nc')
    const added = result.filter(l => l.type === 'added')
    expect(added).toHaveLength(2)
    expect(added.map(l => l.content)).toEqual(['b', 'c'])
  })

  it('detects removed lines', () => {
    const result = computeDiff('a\nb\nc', 'a')
    const removed = result.filter(l => l.type === 'removed')
    expect(removed).toHaveLength(2)
    expect(removed.map(l => l.content)).toEqual(['b', 'c'])
  })

  it('detects modified lines', () => {
    const result = computeDiff('hello world', 'hello mars')
    const removed = result.filter(l => l.type === 'removed')
    const added = result.filter(l => l.type === 'added')
    expect(removed).toHaveLength(1)
    expect(added).toHaveLength(1)
    expect(removed[0].content).toBe('hello world')
    expect(added[0].content).toBe('hello mars')
  })

  it('assigns line numbers correctly', () => {
    const result = computeDiff('a\nb', 'a\nc')
    const context = result.find(l => l.type === 'context')!
    expect(context.oldNum).toBe(1)
    expect(context.newNum).toBe(1)
    const removed = result.find(l => l.type === 'removed')!
    expect(removed.oldNum).toBe(2)
    const added = result.find(l => l.type === 'added')!
    expect(added.newNum).toBe(2)
  })

  it('handles completely different content', () => {
    const result = computeDiff('alpha\nbeta', 'gamma\ndelta')
    const removed = result.filter(l => l.type === 'removed')
    const added = result.filter(l => l.type === 'added')
    expect(removed).toHaveLength(2)
    expect(added).toHaveLength(2)
  })

  it('handles from-empty (all additions)', () => {
    const result = computeDiff('', 'new\nlines')
    const added = result.filter(l => l.type === 'added')
    expect(added.length).toBeGreaterThanOrEqual(1)
  })

  it('handles to-empty (all removals)', () => {
    const result = computeDiff('old\nlines', '')
    const removed = result.filter(l => l.type === 'removed')
    expect(removed.length).toBeGreaterThanOrEqual(1)
  })

  it('uses fast path for large files (>2000 total lines)', () => {
    const bigOld = Array.from({ length: 1100 }, (_, i) => `line ${i}`).join('\n')
    const bigNew = Array.from({ length: 1100 }, (_, i) => `line ${i}`).join('\n')
    const result = computeDiff(bigOld, bigNew)
    expect(result.every(l => l.type === 'context')).toBe(true)
  })
})

describe('countChanges', () => {
  it('counts additions and deletions', () => {
    const result = countChanges('a\nb', 'a\nc\nd')
    expect(result.additions).toBeGreaterThanOrEqual(1)
    expect(result.deletions).toBeGreaterThanOrEqual(1)
  })

  it('returns zero for identical content', () => {
    const result = countChanges('same', 'same')
    expect(result.additions).toBe(0)
    expect(result.deletions).toBe(0)
  })
})
