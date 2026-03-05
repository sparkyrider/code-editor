import { describe, it, expect } from 'vitest'
import { parseLineReferences } from '@/lib/line-links'

describe('parseLineReferences', () => {
  it('parses path:line format', () => {
    const refs = parseLineReferences('Look at src/app.ts:42')
    expect(refs).toHaveLength(1)
    expect(refs[0].filePath).toBe('src/app.ts')
    expect(refs[0].startLine).toBe(42)
  })

  it('parses path:line-line range format', () => {
    const refs = parseLineReferences('See src/app.ts:10-25')
    expect(refs).toHaveLength(1)
    expect(refs[0].startLine).toBe(10)
    expect(refs[0].endLine).toBe(25)
  })

  it('parses path#Lline format', () => {
    const refs = parseLineReferences('Check lib/utils.ts#L15')
    expect(refs.length).toBeGreaterThanOrEqual(1)
    const withPath = refs.find(r => r.filePath !== undefined)!
    expect(withPath.filePath).toBe('lib/utils.ts')
    expect(withPath.startLine).toBe(15)
  })

  it('parses "line N" format', () => {
    const refs = parseLineReferences('The bug is at line 99')
    expect(refs).toHaveLength(1)
    expect(refs[0].startLine).toBe(99)
    expect(refs[0].filePath).toBeUndefined()
  })

  it('parses "lines N-M" format', () => {
    const refs = parseLineReferences('See lines 10-25 for the logic')
    expect(refs).toHaveLength(1)
    expect(refs[0].startLine).toBe(10)
    expect(refs[0].endLine).toBe(25)
  })

  it('parses L42 format', () => {
    const refs = parseLineReferences('Jump to L42')
    expect(refs).toHaveLength(1)
    expect(refs[0].startLine).toBe(42)
  })

  it('parses L10-L25 range format', () => {
    const refs = parseLineReferences('See L10-L25')
    expect(refs).toHaveLength(1)
    expect(refs[0].startLine).toBe(10)
    expect(refs[0].endLine).toBe(25)
  })

  it('deduplicates identical references', () => {
    const refs = parseLineReferences('line 42 and again line 42')
    expect(refs).toHaveLength(1)
  })

  it('parses multiple different references', () => {
    const refs = parseLineReferences('src/a.ts:10 and src/b.ts:20')
    expect(refs).toHaveLength(2)
  })

  it('returns empty for text with no line references', () => {
    const refs = parseLineReferences('Just a normal sentence.')
    expect(refs).toHaveLength(0)
  })
})
