import { createContext, useContext, useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // in ms, 0 = permanent
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => string
  removeNotification: (id: string) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000, // default 4 seconds
    }

    setNotifications((prev) => [...prev, fullNotification])

    // Auto-remove after duration if specified
    if ((fullNotification.duration || 0) > 0) {
      setTimeout(() => removeNotification(id), fullNotification.duration)
    }

    return id
  }, [removeNotification])

  const showSuccess = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'success',
      title,
      message,
    })
  }, [addNotification])

  const showError = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 6000, // errors stay longer
    })
  }, [addNotification])

  const showWarning = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000,
    })
  }, [addNotification])

  const showInfo = useCallback((title: string, message?: string) => {
    addNotification({
      type: 'info',
      title,
      message,
    })
  }, [addNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
