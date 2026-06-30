'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditorStore } from '../../stores/editorStore'
import { Clock, Tag, Plus, Check } from 'lucide-react'
interface EditorProps {
  noteId: string
  initialTitle: string
  initialContent: any
  onSave: (data: { title?: string; content?: any; word_count?: number }) => Promise<void>
}

export default function Editor({ noteId, initialTitle, initialContent, onSave }: EditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const { setSaveState, saveState } = useEditorStore()
  const [initializedNoteId, setInitializedNoteId] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync state with props ONLY when switching notes
  useEffect(() => {
    setTitle(initialTitle)
  }, [noteId])

  // Clear save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const getSafeContent = (content: any) => {
    if (!content) return ''
    if (typeof content === 'object' && Object.keys(content).length === 0) return ''
    return content
  }

  // Debounced auto-save logic
  const triggerSave = (newTitle: string, newContent: any) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveState('saving')
      try {
        let words = 0
        if (editor) {
          const text = editor.getText() || ''
          words = text.split(/\s+/).filter(Boolean).length
        }
        await onSave({ title: newTitle, content: newContent, word_count: words })
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      } catch (e) {
        setSaveState('error')
      }
    }, 2000)
  }

  // Tiptap setup
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Heading...'
          return "Start writing..."
        }
      })
    ],
    content: getSafeContent(initialContent),
    onUpdate: ({ editor: activeEditor }) => {
      triggerSave(title, activeEditor.getJSON())
    }
  })

  // Set editor content when note changes
  useEffect(() => {
    if (editor && noteId !== initializedNoteId) {
      editor.commands.setContent(getSafeContent(initialContent))
      setInitializedNoteId(noteId)
    }
  }, [noteId, initialContent, editor, initializedNoteId])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (editor) {
      triggerSave(val, editor.getJSON())
    }
  }

  // Calculate reading time roughly
  const getReadingTime = () => {
    if (!editor) return '1 min read'
    const text = editor.getText() || ''
    const words = text.split(/\s+/).filter(Boolean).length
    const time = Math.max(1, Math.ceil(words / 200))
    return `${time} min read`
  }

  const handleWrapperClick = (e: React.MouseEvent) => {
    // Only focus the editor if the user clicks on the empty space of the container
    if (e.target === e.currentTarget) {
      editor?.commands.focus()
    }
  }

  return (
    <div 
      onClick={handleWrapperClick}
      className="flex flex-col bg-white py-8 px-8 pb-24 cursor-text"
    >
      {/* Save indicator overlay or header label */}
      <div className="flex items-center justify-between mb-6 text-outline text-xs select-none pointer-events-none">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{getReadingTime()}</span>
        </div>
        <div className="flex items-center gap-2">
          {saveState === 'saving' && (
            <span className="text-primary animate-pulse">Saving...</span>
          )}
          {saveState === 'saved' && (
            <span className="flex items-center gap-1 text-secondary">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          {saveState === 'error' && (
            <span className="text-error">Save failed</span>
          )}
        </div>
      </div>

      {/* Editable Title */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled Note"
        className="w-full mb-4 border-0 outline-none bg-transparent text-on-surface font-headline-lg text-4xl font-bold placeholder:text-outline-variant"
      />

      {/* Editor Content */}
      <div 
        onClick={() => editor?.commands.focus()}
        className="min-h-[400px] cursor-text"
      >
        <EditorContent 
          editor={editor} 
          className="outline-none prose-h1:font-serif prose-h2:font-serif prose-p:font-sans"
        />
      </div>
    </div>
  )
}
