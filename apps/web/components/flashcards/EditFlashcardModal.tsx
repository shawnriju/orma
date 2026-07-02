'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, Save, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Flashcard } from '../../lib/api'
import styles from './flashcards.module.css'

interface EditFlashcardModalProps {
  flashcard: Flashcard
  onClose: () => void
}

export default function EditFlashcardModal({ flashcard, onClose }: EditFlashcardModalProps) {
  const queryClient = useQueryClient()
  const [question, setQuestion] = useState(flashcard.question)
  const [answer, setAnswer] = useState(flashcard.answer)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error) return err.message || fallback
    if (typeof err === 'string') return err || fallback
    return fallback
  }

  const updateMutation = useMutation({
    mutationFn: () => api.flashcards.update(flashcard.id, { question, answer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
      onClose()
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err, 'Failed to update flashcard.'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.flashcards.delete(flashcard.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] })
      queryClient.invalidateQueries({ queryKey: ['study'] })
      onClose()
    },
    onError: (err: unknown) => {
      setErrorMsg(getErrorMessage(err, 'Failed to delete flashcard.'))
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

  return createPortal(
    <div className={styles.overlay}>
      <div 
        className={`${styles.modal} ${styles.modalCompact}`}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Edit Flashcard</h2>
          <button 
            onClick={onClose}
            className={styles.iconButton}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={styles.editBody}>
          {errorMsg && (
            <div className={styles.bannerError}>
              {errorMsg}
            </div>
          )}

          <div className={styles.editField}>
            <label className={styles.editLabel}>Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={`${styles.editTextarea} ${styles.editTextareaQuestion}`}
            />
          </div>

          <div className={styles.editField}>
            <label className={styles.editLabel}>Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className={`${styles.editTextarea} ${styles.editTextareaAnswer}`}
            />
          </div>
        </div>

        <div className={styles.editFooter}>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending || updateMutation.isPending}
            className={`${styles.editDeleteButton} ${styles.footerButtonDisabled}`}
          >
            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Delete</span>
          </button>

          <div className={styles.editFooterActions}>
            <button
              onClick={onClose}
              disabled={updateMutation.isPending || deleteMutation.isPending}
              className={`${styles.editCancelButton} ${styles.footerButtonDisabled}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending || deleteMutation.isPending || (!question.trim() || !answer.trim())}
              className={`${styles.editSaveButton} ${styles.footerButtonDisabled}`}
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
