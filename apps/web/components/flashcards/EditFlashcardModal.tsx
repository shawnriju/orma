'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Flashcard } from '../../lib/api'
import { editModalShellStyles } from './styles'
import EditModalHeader from './EditModalHeader'
import EditModalFields from './EditModalFields'
import EditModalFooter from './EditModalFooter'

interface EditFlashcardModalProps {
  flashcard: Flashcard
  onClose: () => void
}

export default function EditFlashcardModal({ flashcard, onClose }: EditFlashcardModalProps) {
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)
  const [question, setQuestion] = useState(flashcard.question)
  const [answer, setAnswer] = useState(flashcard.answer)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    setMounted(true)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const updateMutation = useMutation({
    mutationFn: () => api.flashcards.update(flashcard.id, { question, answer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
      onClose()
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to update flashcard.')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.flashcards.delete(flashcard.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
      onClose()
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to delete flashcard.')
    }
  })

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteMutation.mutate()
    }
  }

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      setErrorMsg('Question and answer cannot be empty.')
      return
    }
    updateMutation.mutate()
  }

  if (!mounted) return null

  return createPortal(
    <div className={editModalShellStyles.backdrop}>
      <div
        className={editModalShellStyles.panel}
        onClick={e => e.stopPropagation()}
      >
        <EditModalHeader onClose={onClose} />

        <EditModalFields
          question={question}
          onQuestionChange={setQuestion}
          answer={answer}
          onAnswerChange={setAnswer}
          errorMsg={errorMsg}
        />

        <EditModalFooter
          onDelete={handleDelete}
          onCancel={onClose}
          onSave={handleSave}
          isDeleting={deleteMutation.isPending}
          isSaving={updateMutation.isPending}
          canSave={!!question.trim() && !!answer.trim()}
        />
      </div>
    </div>,
    document.body
  )
}