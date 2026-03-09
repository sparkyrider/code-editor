/**
 * Plan Parser — extracts structured plan steps from agent responses.
 *
 * Handles markdown numbered lists with descriptions and file references:
 *   1. **Step title**
 *      Description text here
 *      `src/file.ts`, `lib/utils.ts`
 */

export interface ParsedPlanStep {
  id: string
  title: string
  description?: string
  status: 'pending' | 'running' | 'done' | 'error' | 'skipped'
  files?: string[]
}

/**
 * Extract file paths from text (backtick-wrapped paths with extensions).
 */
function extractFiles(text: string): string[] {
  const files: string[] = []
  const matches = text.matchAll(/`([^`]+\.[a-zA-Z]{1,10})`/g)
  for (const m of matches) {
    const f = m[1].trim()
    // Filter out things that look like code snippets, not file paths
    if (f.includes(' ') || f.startsWith('npm') || f.startsWith('pnpm') || f.length > 100) continue
    files.push(f)
  }
  return [...new Set(files)] // dedupe
}

/**
 * Parse a markdown numbered list into plan steps.
 * Supports:
 *   1. **Bold title** — inline description
 *   1. Title text
 *      Indented description on next line(s)
 *      `file/path.ts`
 */
export function parsePlanSteps(text: string): ParsedPlanStep[] {
  const steps: ParsedPlanStep[] = []
  const lines = text.split('\n')

  let currentStep: ParsedPlanStep | null = null
  let descLines: string[] = []

  const flushStep = () => {
    if (!currentStep) return
    const descText = descLines.join('\n').trim()
    if (descText) {
      // Extract files from description
      const files = extractFiles(descText)
      currentStep.description = descText
        // Clean up backtick file refs from description display
        .replace(/`([^`]+\.[a-zA-Z]{1,10})`/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim() || undefined
      if (files.length > 0) currentStep.files = files
    }
    // Also extract files from the title
    const titleFiles = extractFiles(currentStep.title)
    if (titleFiles.length > 0) {
      currentStep.files = [...new Set([...(currentStep.files ?? []), ...titleFiles])]
    }
    steps.push(currentStep)
    currentStep = null
    descLines = []
  }

  for (const line of lines) {
    // Match numbered step: "1. **Title**" or "1. Title" or "1. **Title** — description"
    const stepMatch = line.match(/^(\d+)\.\s+\*{0,2}(.+?)\*{0,2}\s*$/)
    if (stepMatch) {
      flushStep()
      const num = stepMatch[1]
      let title = stepMatch[2].trim()
      // Remove trailing colon
      title = title.replace(/:$/, '').trim()
      // Split on em dash for inline description
      const dashIdx = title.indexOf('—')
      let inlineDesc: string | undefined
      if (dashIdx > 0) {
        inlineDesc = title.slice(dashIdx + 1).trim()
        title = title.slice(0, dashIdx).trim()
      }
      currentStep = {
        id: `step-${num}`,
        title,
        description: inlineDesc,
        status: 'pending',
      }
      if (inlineDesc) {
        descLines.push(inlineDesc)
      }
      continue
    }

    // Indented continuation line (belongs to current step)
    if (currentStep && (line.startsWith('   ') || line.startsWith('\t') || line.trim().startsWith('-') || line.trim().startsWith('•'))) {
      descLines.push(line.trim())
      continue
    }

    // Empty line — might separate steps
    if (currentStep && line.trim() === '') {
      descLines.push('')
      continue
    }

    // Non-matching line — flush if we had a step
    if (currentStep && line.trim() !== '') {
      // Could be continuation without indent (loose markdown)
      // Only treat as continuation if it doesn't look like a new section
      if (!line.match(/^#+\s/) && !line.match(/^---/) && !line.match(/^\d+\./)) {
        descLines.push(line.trim())
      } else {
        flushStep()
      }
    }
  }

  flushStep()
  return steps
}

/**
 * Check if a message content contains a plan (3+ numbered steps).
 */
export function isPlanContent(text: string): boolean {
  return parsePlanSteps(text).length >= 3
}
