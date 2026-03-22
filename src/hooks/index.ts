import { useState, useCallback } from 'react'
export { useKeyboardShortcuts, SHORTCUTS } from './useKeyboardShortcuts'

export function useSelection<T extends { id: number }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(item => item.id)))
  }, [items])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === items.length) deselectAll()
    else selectAll()
  }, [items.length, selectedIds.size, selectAll, deselectAll])

  const isSelected = useCallback((id: number) => selectedIds.has(id), [selectedIds])
  const isAllSelected = useCallback(() => selectedIds.size === items.length && items.length > 0, [selectedIds.size, items.length])
  const isSomeSelected = useCallback(() => selectedIds.size > 0 && selectedIds.size < items.length, [selectedIds.size, items.length])
  const selectionCount = selectedIds.size

  return {
    selectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
    selectionCount,
  }
}
