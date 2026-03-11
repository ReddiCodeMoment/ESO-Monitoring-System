import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { NotificationProvider } from './context/NotificationContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { DataManagement } from './components/DataManagement'
import { Settings } from './components/Settings'
import { NotificationToast } from './components/NotificationToast'
import './styles/layout.css'
import './styles/header.css'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Login />
  }

  return <AuthenticatedApp />
}

function AuthenticatedApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'settings'>('dashboard')

  return (
    <div className="app-container">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="app-main">
        <Sidebar activeTab={activeTab} onTabChange={(tab: any) => setActiveTab(tab)} />
        <div className="app-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'data' && <DataManagement />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  // Ensure theme is applied as soon as the app loads,
  // before the user navigates to Settings.
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
      const initialTheme = stored === 'dark' || stored === 'light' ? stored : 'light'
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    } catch {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [])

  return (
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <AppContent />
          <NotificationToast />
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  )
}
