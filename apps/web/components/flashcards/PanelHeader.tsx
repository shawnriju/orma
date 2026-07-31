import React from 'react'
import { Sparkles, X } from 'lucide-react'
import { panelHeaderStyles } from './styles'

interface PanelHeaderProps {
  isDragging: boolean
  onDragStart: (event: React.PointerEvent<HTMLDivElement>) => void
  onDragMove: (event: React.PointerEvent<HTMLDivElement>) => void
  onDragEnd: (event: React.PointerEvent<HTMLDivElement>) => void
  onClose: () => void
}

export default function PanelHeader({ isDragging, onDragStart, onDragMove, onDragEnd, onClose }: PanelHeaderProps) {
  return (
    <div className={`${panelHeaderStyles.barBase} ${isDragging ? panelHeaderStyles.barDragging : ''}`}>
      <div
        className={panelHeaderStyles.dragZone}
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onPointerLeave={onDragEnd}
      >
        <div className={panelHeaderStyles.titleRow}>
          <span className={panelHeaderStyles.iconBadge}>
            <Sparkles className={panelHeaderStyles.icon} />
          </span>
          <h2 className={panelHeaderStyles.title}>Magic Study</h2>
        </div>
        <p className={panelHeaderStyles.subtitle}>Drag this panel around to keep the note visible underneath.</p>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        className={panelHeaderStyles.closeButton}
      >
        <X className={panelHeaderStyles.closeIcon} />
      </button>
    </div>
  )
}
