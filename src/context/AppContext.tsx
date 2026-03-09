import React, { createContext, useContext, useState } from 'react'

interface AppContextType {
  notification: { type: 'success' | 'error'; text: string } | null
  setNotification: (notification: { type: 'success' | 'error'; text: string } | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  return (
    <AppContext.Provider value={{ notification, setNotification }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
