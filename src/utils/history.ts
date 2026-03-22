// Undo/Redo History Management
export interface HistoryState<T> {
  state: T
  timestamp: number
  description: string
}

export class UndoRedoManager<T> {
  private history: HistoryState<T>[] = []
  private currentIndex: number = -1
  private maxHistory: number = 20

  push(state: T, description: string = 'Action') {
    // Remove any redo history when adding new action
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    this.history.push({
      state: JSON.parse(JSON.stringify(state)), // Deep copy
      timestamp: Date.now(),
      description
    })

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }

  undo(): T | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.history[this.currentIndex].state
    }
    return null
  }

  redo(): T | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.history[this.currentIndex].state
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  getCurrentState(): T | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex].state
    }
    return null
  }

  clear() {
    this.history = []
    this.currentIndex = -1
  }

  getHistory() {
    return this.history.slice(0, this.currentIndex + 1).map(h => ({
      description: h.description,
      timestamp: h.timestamp
    }))
  }
}
