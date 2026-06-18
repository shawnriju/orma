import { create } from 'zustand'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface EditorStore {
  saveState: SaveState
  setSaveState: (state: SaveState) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  saveState: 'idle',
  setSaveState: (saveState) => set({ saveState }),
}))
