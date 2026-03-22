import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: () => void
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault()
          shortcut.callback()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Predefined shortcuts
export const SHORTCUTS = {
  CREATE_PROGRAM: { key: 'n', ctrlKey: true, description: 'Create new program (Ctrl+N)' },
  SEARCH: { key: 'k', ctrlKey: true, description: 'Open search (Ctrl+K)' },
  CLOSE: { key: 'Escape', description: 'Close modal (ESC)' },
  UNDO: { key: 'z', ctrlKey: true, description: 'Undo (Ctrl+Z)' },
  REDO: { key: 'y', ctrlKey: true, description: 'Redo (Ctrl+Y)' },
  SAVE: { key: 's', ctrlKey: true, description: 'Save (Ctrl+S)' },
}
