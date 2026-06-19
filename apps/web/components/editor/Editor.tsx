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
  initialTags?: string[]
  onSave: (data: { title?: string; content?: any; tags?: string[]; word_count?: number }) => Promise<void>
}

export default function Editor({ noteId, initialTitle, initialContent, initialTags = [], onSave }: EditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [tags, setTags] = useState<string[]>(initialTags)
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [newTagVal, setNewTagVal] = useState('')
  const { setSaveState, saveState } = useEditorStore()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync state with props ONLY when switching notes
  useEffect(() => {
    setTitle(initialTitle)
    setTags(initialTags || [])
  }, [noteId])

  // Clear save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

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
    content: initialContent || '',
    onUpdate: ({ editor }) => {
      triggerSave(title, editor.getJSON(), tags)
    }
  })

  // Set editor content when note changes
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent)
    }
  }, [noteId, initialContent, editor])

  // Debounced auto-save logic
  const triggerSave = (newTitle: string, newContent: any, newTags: string[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    setSaveState('saving')

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        let words = 0
        if (editor) {
          const text = editor.getText() || ''
          words = text.split(/\s+/).filter(Boolean).length
        }
        await onSave({ title: newTitle, content: newContent, tags: newTags, word_count: words })
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 2000)
      } catch (e) {
        setSaveState('error')
      }
    }, 2000)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTitle(val)
    if (editor) {
      triggerSave(val, editor.getJSON(), tags)
    }
  }

  const handleAddTag = () => {
    if (newTagVal.trim() && !tags.includes(newTagVal.trim())) {
      const updated = [...tags, newTagVal.trim()]
      setTags(updated)
      setNewTagVal('')
      setIsAddingTag(false)
      if (editor) {
        triggerSave(title, editor.getJSON(), updated)
      }
    }
  }

  const handleRemoveTag = (tag: string) => {
    const updated = tags.filter(t => t !== tag)
    setTags(updated)
    if (editor) {
      triggerSave(title, editor.getJSON(), updated)
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
      className="flex-1 flex flex-col h-full bg-[#fff] overflow-y-auto px-8 md:px-16 py-8 cursor-text"
    >
      {/* Save indicator overlay or header label */}
      <div className="flex items-center justify-between text-xs text-[#87736c] mb-6 select-none pointer-events-none">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{getReadingTime()}</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          {saveState === 'saving' && (
            <span className="text-[#94492c] animate-pulse">Saving...</span>
          )}
          {saveState === 'saved' && (
            <span className="text-[#506351] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {saveState === 'error' && (
            <span className="text-[#ba1a1a]">Save failed</span>
          )}
        </div>
      </div>

      {/* Editable Title */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Untitled Note"
        className="w-full text-4xl md:text-5xl font-bold font-serif text-[#1e1b18] placeholder-[#dac1b9] outline-none border-none mb-6 bg-transparent"
      />

      {/* Tags Row */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {tags.map((tag) => (
          <span 
            key={tag}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#f5ece7] text-[#54433d] rounded-full text-xs font-semibold hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-all cursor-pointer select-none"
            onClick={() => handleRemoveTag(tag)}
          >
            <span>#{tag}</span>
          </span>
        ))}
        {isAddingTag ? (
          <div className="flex items-center gap-1 bg-[#fff8f5] border border-[#dac1b9] rounded-full px-2 py-0.5">
            <input 
              type="text"
              autoFocus
              value={newTagVal}
              onChange={(e) => setNewTagVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Tag..."
              className="text-xs bg-transparent outline-none w-16 text-[#54433d]"
            />
            <button onClick={handleAddTag} className="text-[#94492c] hover:text-[#d67d5c]">
              <Check className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingTag(true)}
            className="flex items-center gap-1 px-3 py-1 bg-[#fff] border border-[#dac1b9] text-[#87736c] hover:text-[#94492c] hover:border-[#94492c] rounded-full text-xs font-semibold transition-all select-none"
          >
            <Plus className="w-3 h-3" />
            <span>Add Tag</span>
          </button>
        )}
      </div>

      {/* Editor Content */}
      <div 
        onClick={() => editor?.commands.focus()}
        className="prose prose-neutral max-w-none flex-1 focus:outline-none cursor-text min-h-[400px]"
      >
        <EditorContent 
          editor={editor} 
          className="outline-none prose-h1:font-serif prose-h2:font-serif prose-p:font-sans"
        />
      </div>
    </div>
  )
}
