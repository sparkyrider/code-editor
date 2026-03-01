/**
 * Inline diff decorations for Monaco editor.
 * Shows agent-proposed changes as green (added) / red (removed) highlights
 * directly in the editor, Cursor-style.
 */

type Monaco = typeof import('monaco-editor')
type IStandaloneCodeEditor = import('monaco-editor').editor.IStandaloneCodeEditor

export interface InlineDiffResult {
  /** Dispose decorations and widgets */
  dispose: () => void
  /** Accept the proposed changes */
  accept: () => void
  /** Reject and restore original */
  reject: () => void
}

/**
 * Apply inline diff decorations showing proposed changes.
 * Returns controls to accept, reject, or dispose.
 */
export function showInlineDiff(
  editor: IStandaloneCodeEditor,
  monaco: Monaco,
  originalContent: string,
  proposedContent: string,
  onAccept?: () => void,
  onReject?: () => void,
): InlineDiffResult {
  const model = editor.getModel()
  if (!model) throw new Error('No editor model')

  const origLines = originalContent.split('\n')
  const propLines = proposedContent.split('\n')

  // Simple line-level diff
  const decorations: import('monaco-editor').editor.IModelDeltaDecoration[] = []
  const maxLen = Math.max(origLines.length, propLines.length)

  for (let i = 0; i < maxLen; i++) {
    const origLine = origLines[i]
    const propLine = propLines[i]

    if (origLine === undefined && propLine !== undefined) {
      // Added line — highlight green
      decorations.push({
        range: new monaco.Range(i + 1, 1, i + 1, 1),
        options: {
          isWholeLine: true,
          className: 'inline-diff-added',
          glyphMarginClassName: 'inline-diff-glyph-added',
          minimap: { color: '#22c55e40', position: 2 },
        },
      })
    } else if (propLine === undefined && origLine !== undefined) {
      // Removed line — highlight red (strikethrough)
      if (i < model.getLineCount()) {
        decorations.push({
          range: new monaco.Range(i + 1, 1, i + 1, model.getLineMaxColumn(i + 1)),
          options: {
            isWholeLine: true,
            className: 'inline-diff-removed',
            glyphMarginClassName: 'inline-diff-glyph-removed',
            minimap: { color: '#ef444440', position: 2 },
          },
        })
      }
    } else if (origLine !== propLine) {
      // Changed line — highlight with modified background
      if (i < model.getLineCount()) {
        decorations.push({
          range: new monaco.Range(i + 1, 1, i + 1, model.getLineMaxColumn(i + 1)),
          options: {
            isWholeLine: true,
            className: 'inline-diff-modified',
            glyphMarginClassName: 'inline-diff-glyph-modified',
            minimap: { color: '#eab30840', position: 2 },
          },
        })
      }
    }
  }

  // Apply content change (show proposed) and decorations
  const currentContent = model.getValue()
  model.setValue(proposedContent)
  const decorationIds = editor.deltaDecorations([], decorations)

  // Scroll to first change
  const firstDeco = decorations[0]
  if (firstDeco) {
    editor.revealLineInCenter(firstDeco.range.startLineNumber)
  }

  return {
    dispose: () => {
      editor.deltaDecorations(decorationIds, [])
    },
    accept: () => {
      editor.deltaDecorations(decorationIds, [])
      // Content already set to proposed
      onAccept?.()
    },
    reject: () => {
      editor.deltaDecorations(decorationIds, [])
      model.setValue(currentContent)
      onReject?.()
    },
  }
}
