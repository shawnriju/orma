'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DraftCard } from './types'
import { panelShellStyles, panelBodyStyles } from './styles'
import TriggerButton from './TriggerButton'
import PanelHeader from './PanelHeader'
import ChooseModeView from './ChooseModeView'
import AiModeView from './AiModeView'
import CustomModeView from './CustomModeView'
import PanelFooter from './PanelFooter'

interface FlashcardPanelProps {
  noteId: string
  wordCount: number
}

export default function FlashcardPanel({ noteId, wordCount }: FlashcardPanelProps) {
  const queryClient = useQueryClient()
  const [draftCards, setDraftCards] = useState<DraftCard[]>([])
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set())
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'choose' | 'custom' | 'ai'>('choose')
  const [mounted, setMounted] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStateRef = React.useRef({ offsetX: 0, offsetY: 0 })
  const autoCloseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return

    const modalWidth = Math.min(window.innerWidth - 32, 840)
    const modalHeight = Math.min(window.innerHeight - 32, 680)

    setModalPosition({
      x: Math.max(16, window.innerWidth - modalWidth - 72),
      y: Math.max(96, window.innerHeight - modalHeight - 72),
    })
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const resetDraftState = () => {
    setDraftCards([])
    setExpandedCards(new Set())
    setSelectedCards(new Set())
    setSuccessMsg('')
    setErrorMsg('')
  }

  const openModal = () => {
    resetDraftState()
    setMode('choose')
    setIsOpen(true)
  }

  const closeModal = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
    setIsOpen(false)
    resetDraftState()
    setMode('choose')
  }

  const startCustomFlow = () => {
    setMode('custom')
    setDraftCards([{ question: '', answer: '' }])
    setExpandedCards(new Set([0]))
    setSelectedCards(new Set())
    setSuccessMsg('')
    setErrorMsg('')
  }

  const startAiFlow = () => {
    setMode('ai')
    setDraftCards([])
    setExpandedCards(new Set())
    setSelectedCards(new Set())
    setSuccessMsg('')
    setErrorMsg('')
  }

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: () => api.flashcards.generate(noteId),
    onSuccess: (cards) => {
      if (!cards || cards.length === 0) {
        setErrorMsg('The AI could not extract any educational facts from this note. Please add more study material.')
        setDraftCards([])
      } else {
        setDraftCards(cards)
        setExpandedCards(new Set())
        setSelectedCards(new Set())
        setMode('custom')
        setErrorMsg('')
        setSuccessMsg('')
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to generate flashcards.')
    }
  })

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (cards: DraftCard[]) => api.flashcards.save(noteId, cards),
    onSuccess: () => {
      setSuccessMsg('Flashcards saved successfully!')
      setDraftCards([])
      setErrorMsg('')
      queryClient.invalidateQueries({ queryKey: ['note-stats', noteId] })

      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }

      autoCloseTimerRef.current = setTimeout(() => {
        setIsOpen(false)
        resetDraftState()
        setMode('choose')
        autoCloseTimerRef.current = null
      }, 1500)
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to save flashcards.')
    }
  })

  const handleUpdateCard = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...draftCards]
    updated[index][field] = value
    setDraftCards(updated)
  }

  const handleDeleteCard = (index: number) => {
    setDraftCards(draftCards.filter((_, i) => i !== index))
    setExpandedCards(prev => {
      const next = new Set<number>()
      prev.forEach(i => {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      })
      return next
    })
    setSelectedCards(prev => {
      const next = new Set<number>()
      prev.forEach(i => {
        if (i < index) next.add(i)
        else if (i > index) next.add(i - 1)
      })
      return next
    })
  }

  const addCard = () => {
    setDraftCards((current) => {
      const newIdx = current.length
      setExpandedCards(prev => {
        const next = new Set(prev)
        next.add(newIdx)
        return next
      })
      return [...current, { question: '', answer: '' }]
    })
  }

  const handleSaveAll = () => {
    if (draftCards.length === 0) return
    saveMutation.mutate(draftCards)
  }

  const allSelected = draftCards.length > 0 && selectedCards.size === draftCards.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedCards(new Set())
    } else {
      setSelectedCards(new Set(draftCards.map((_, i) => i)))
    }
  }

  const handleDeleteSelected = () => {
    const toDelete = Array.from(selectedCards)
    const newCards = draftCards.filter((_, i) => !toDelete.includes(i))
    setDraftCards(newCards)
    setSelectedCards(new Set())
    setExpandedCards(prev => {
       const next = new Set<number>()
       let currentNewIndex = 0
       for(let i=0; i<draftCards.length; i++) {
         if (!toDelete.includes(i)) {
           if (prev.has(i)) next.add(currentNewIndex)
           currentNewIndex++
         }
       }
       return next
    })
  }

  const toggleSelectCard = (index: number) => {
    setSelectedCards(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const toggleExpandCard = (index: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const hasUnsavedDrafts = draftCards.length > 0 && mode === 'custom'

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isOpen) return

    dragStateRef.current = {
      offsetX: event.clientX - modalPosition.x,
      offsetY: event.clientY - modalPosition.y,
    }
    setIsDragging(true)
    ;(event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId)
  }

  const handleDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const modalWidth = Math.min(window.innerWidth - 32, 840)
    const modalHeight = Math.min(window.innerHeight - 32, 680)
    const maxX = Math.max(16, window.innerWidth - modalWidth - 16)
    const maxY = Math.max(16, window.innerHeight - 96)

    setModalPosition({
      x: Math.min(maxX, Math.max(16, event.clientX - dragStateRef.current.offsetX)),
      y: Math.min(maxY, Math.max(0, event.clientY - dragStateRef.current.offsetY)),
    })
  }

  const handleDragEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      ;(event.currentTarget as HTMLDivElement).releasePointerCapture(event.pointerId)
    } catch {
      // Pointer capture may already be released when the drag ends.
    }
  }

  return (
    <>
      <TriggerButton onOpen={openModal} />

      {mounted && isOpen && createPortal(
        <div className={panelShellStyles.overlayWrap}>
          <div
            className={panelShellStyles.positionedPanel}
            style={{ left: modalPosition.x, top: modalPosition.y }}
          >
            <PanelHeader
              isDragging={isDragging}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onClose={closeModal}
            />

            <div className={panelBodyStyles.wrap}>
              {hasUnsavedDrafts && !saveMutation.isPending && (
                <div className={panelBodyStyles.unsavedBanner}>
                  You have unsaved flashcards in this panel. Save them before closing if you want to keep the draft.
                </div>
              )}

              {mode === 'choose' && (
                <ChooseModeView onStartCustom={startCustomFlow} onStartAi={startAiFlow} />
              )}

              {mode === 'ai' && (
                <AiModeView
                  errorMsg={errorMsg}
                  isPending={generateMutation.isPending}
                  hasNoDrafts={draftCards.length === 0}
                  wordCount={wordCount}
                  onGenerate={() => generateMutation.mutate()}
                  onSwitchToCustom={startCustomFlow}
                />
              )}

              {mode === 'custom' && (
                <CustomModeView
                  successMsg={successMsg}
                  errorMsg={errorMsg}
                  draftCards={draftCards}
                  expandedCards={expandedCards}
                  selectedCards={selectedCards}
                  allSelected={allSelected}
                  onAddCard={addCard}
                  onToggleSelectAll={toggleSelectAll}
                  onDeleteSelected={handleDeleteSelected}
                  onToggleSelectCard={toggleSelectCard}
                  onToggleExpandCard={toggleExpandCard}
                  onUpdateCard={handleUpdateCard}
                  onDeleteCard={handleDeleteCard}
                />
              )}
            </div>

            <PanelFooter
              mode={mode}
              isSaving={saveMutation.isPending}
              draftCardsCount={draftCards.length}
              onSwitchToAi={startAiFlow}
              onSaveAll={handleSaveAll}
            />
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
