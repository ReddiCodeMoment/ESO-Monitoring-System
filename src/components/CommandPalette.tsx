import { useState } from 'react'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export interface CommandAction {
  id: string
  label: string
  description?: string
  shortcut?: string
  action: () => void
  icon?: string
}

export function CommandPalette({
  commands,
  onUndoRedo,
  onCreateProgram
}: {
  commands: CommandAction[]
  onUndoRedo?: {
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
  }
  onCreateProgram?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const allCommands: CommandAction[] = [
    ...commands,
    ...(onCreateProgram ? [{
      id: 'create-program',
      label: 'Create New Program',
      description: 'Start a new extension program',
      shortcut: 'Ctrl+N',
      action: onCreateProgram,
      icon: '➕'
    }] : []),
    ...(onUndoRedo ? [{
      id: 'undo',
      label: 'Undo',
      shortcut: 'Ctrl+Z',
      action: onUndoRedo.onUndo,
      icon: '↶'
    }, {
      id: 'redo',
      label: 'Redo',
      shortcut: 'Ctrl+Y',
      action: onUndoRedo.onRedo,
      icon: '↷'
    }] : [])
  ]

  const filteredCommands = allCommands.filter(cmd =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectCommand = (command: CommandAction) => {
    command.action()
    setIsOpen(false)
    setSearchQuery('')
  }

  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => setIsOpen(!isOpen)
    },
    {
      key: 'Escape',
      callback: () => {
        setIsOpen(false)
        setSearchQuery('')
      }
    }
  ])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-auto md:right-6 md:top-6 p-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-lg transition"
        title="Command Palette (Ctrl+K)"
      >
        <span className="text-xl">⌘</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands..."
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command) => (
              <button
                key={command.id}
                onClick={() => handleSelectCommand(command)}
                className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {command.icon && <span className="text-lg">{command.icon}</span>}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {command.label}
                    </p>
                    {command.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {command.description}
                      </p>
                    )}
                  </div>
                </div>
                {command.shortcut && (
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    {command.shortcut}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
              No commands found for "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 flex justify-between">
          <span>↑↓ Navigate • ↵ Select • ESC Close</span>
          <span>{filteredCommands.length} commands</span>
        </div>
      </div>
    </div>
  )
}
