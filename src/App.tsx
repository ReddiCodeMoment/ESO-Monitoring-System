import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
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
      <Header />
      <main className="app-main">
        <Sidebar activeTab={activeTab} onTabChange={(tab: any) => setActiveTab(tab)} />
        <div className="app-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'data' && <div className="content-section"><h2>Data Management</h2><p>Add your data management content here</p></div>}
          {activeTab === 'settings' && <div className="content-section"><h2>Settings</h2><p>Add your settings content here</p></div>}
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
