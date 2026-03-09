import React, { createContext, useContext, useState, useCallback } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: { id: string; email: string } | null
  login: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)

  const login = useCallback(async (email: string) => {
    // TODO: Implement authentication logic
    setIsAuthenticated(true)
    setUser({ id: email.split('@')[0], email })
  }, [])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
