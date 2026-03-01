'use client'

import { useCallback, useRef, useEffect, useState } from 'react'

interface ResizeHandleProps {
  direction: 'horizontal'
  onResize: (delta: number) => void
  onResizeEnd?: () => void
}

export function ResizeHandle({ direction, onResize, onResizeEnd }: ResizeHandleProps) {
  const [dragging, setDragging] = useState(false)
  const startRef = useRef(0)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setDragging(true)
    startRef.current = e.clientX
  }, [])

  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startRef.current
      startRef.current = e.clientX
      onResize(delta)
    }

    const handleMouseUp = () => {
      setDragging(false)
      onResizeEnd?.()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [dragging, onResize, onResizeEnd])

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`shrink-0 relative group cursor-col-resize ${dragging ? 'z-50' : ''}`}
      style={{ width: 5 }}
    >
      {/* Visible line */}
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 transition-all ${
          dragging
            ? 'w-[2px] bg-[var(--brand)]'
            : 'w-px bg-[var(--border)] group-hover:w-[2px] group-hover:bg-[var(--brand)]'
        }`}
      />
      {/* Wider hit area */}
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  )
}
