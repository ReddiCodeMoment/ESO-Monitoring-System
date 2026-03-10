import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { DataManagement } from './components/DataManagement'
import { Settings } from './components/Settings'
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
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  )
}
