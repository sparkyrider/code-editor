/**
 * Parse line references from agent messages and dispatch navigation events.
 *
 * Patterns matched:
 *   - line 42
 *   - lines 10-25
 *   - L42, L10-L25
 *   - path/to/file.ts:42
 *   - path/to/file.ts#L42
 *   - path/to/file.ts lines 10-25
 */

export interface LineReference {
  filePath?: string
  startLine: number
  endLine?: number
}

const LINE_PATTERNS = [
  // path:line or path#Lline
  /(?<path>[\w./\-]+\.\w+)(?:[:#]L?)(?<start>\d+)(?:-L?(?<end>\d+))?/g,
  // "line 42" or "lines 10-25"
  /\blines?\s+(?<start>\d+)(?:\s*[-–]\s*(?<end>\d+))?/gi,
  // L42 or L10-L25 (standalone)
  /\bL(?<start>\d+)(?:-L?(?<end>\d+))?/g,
]

export function parseLineReferences(text: string): LineReference[] {
  const refs: LineReference[] = []
  const seen = new Set<string>()

  for (const pattern of LINE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags)
    for (const match of text.matchAll(regex)) {
      const groups = match.groups ?? {}
      const startLine = parseInt(groups.start ?? '', 10)
      if (isNaN(startLine)) continue

      const endLine = groups.end ? parseInt(groups.end, 10) : undefined
      const filePath = groups.path ?? undefined
      const key = `${filePath ?? ''}:${startLine}:${endLine ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)

      refs.push({ filePath, startLine, endLine })
    }
  }

  return refs
}

/**
 * Navigate Monaco editor to a specific line (and optionally highlight a range).
 */
export function navigateToLine(startLine: number, endLine?: number) {
  window.dispatchEvent(new CustomEvent('editor-navigate', {
    detail: { startLine, endLine },
  }))
}
