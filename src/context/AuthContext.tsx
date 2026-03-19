import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  userEmail: string | null
  login: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth')
      if (stored) {
        const { email, authenticated } = JSON.parse(stored)
        if (authenticated && email) {
          setIsAuthenticated(true)
          setUserEmail(email)
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string) => {
    // TODO: Implement authentication logic
    setIsAuthenticated(true)
    setUserEmail(email)
    // Persist to localStorage
    try {
      localStorage.setItem('auth', JSON.stringify({ email, authenticated: true }))
    } catch (error) {
      console.error('Failed to save auth state:', error)
    }
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUserEmail(null)
    // Clear from localStorage
    try {
      localStorage.removeItem('auth')
    } catch (error) {
      console.error('Failed to clear auth state:', error)
    }
  }, [])

  // Prevent rendering until auth state is loaded
  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafb' }} />
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
