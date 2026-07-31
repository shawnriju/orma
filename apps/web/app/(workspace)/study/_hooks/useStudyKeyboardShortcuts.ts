import { useEffect } from 'react'

interface StudyKeyboardOptions {
  onPrev: () => void
  onNext: () => void
  onToggleFlip: () => void
  canGoPrev: boolean
  canGoNext: boolean
  isDisabled?: boolean
}

export function useStudyKeyboardShortcuts({
  onPrev,
  onNext,
  onToggleFlip,
  canGoPrev,
  canGoNext,
  isDisabled = false,
}: StudyKeyboardOptions) {
  useEffect(() => {
    if (isDisabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Guard against active text inputs/textareas/editable elements
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return
      }

      // Ignore key repeat when holding down keys
      if (e.repeat) {
        if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault()
        }
        return
      }

      // 2. Spacebar -> Flip card
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        onToggleFlip()
        return
      }

      // 3. ArrowLeft -> Previous card
      if (e.key === 'ArrowLeft') {
        if (canGoPrev) {
          e.preventDefault()
          onPrev()
        }
        return
      }

      // 4. ArrowRight -> Next card
      if (e.key === 'ArrowRight') {
        if (canGoNext) {
          e.preventDefault()
          onNext()
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onPrev, onNext, onToggleFlip, canGoPrev, canGoNext, isDisabled])
}
