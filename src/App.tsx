import { useState, useEffect } from 'react'
import { ExtensionProgram, Project, Activity } from './types'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { NotificationProvider } from './context/NotificationContext'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { Login } from './components/Login'
import { Dashboard } from './components/Dashboard'
import { DataManagement } from './components/DataManagement'
import { Analytics } from './components/Analytics'
import { Settings } from './components/Settings'
import { NotificationToast } from './components/NotificationToast'
import { CommandPalette, CommandAction } from './components/CommandPalette'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'analytics' | 'settings'>('dashboard')
  const [allPrograms, setAllPrograms] = useState<ExtensionProgram[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [allActivities, setAllActivities] = useState<Activity[]>([])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      callback: () => setActiveTab('data')
    }
  ])

  const commands: CommandAction[] = [
    {
      id: 'view-dashboard',
      label: 'View Dashboard',
      description: 'Go to main dashboard',
      action: () => setActiveTab('dashboard'),
      icon: '📊'
    },
    {
      id: 'view-data',
      label: 'View Data Management',
      description: 'Manage programs and activities',
      action: () => setActiveTab('data'),
      icon: '📋'
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      description: 'See analytics and insights',
      action: () => setActiveTab('analytics'),
      icon: '📈'
    },
    {
      id: 'view-settings',
      label: 'View Settings',
      description: 'Adjust your preferences',
      action: () => setActiveTab('settings'),
      icon: '⚙️'
    }
  ]

  return (
    <div className="app-container">
      <Header />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="app-main">
        <div className="app-content">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'data' && <DataManagement onDataUpdate={(programs, projects, activities) => {
            setAllPrograms(programs)
            setAllProjects(projects)
            setAllActivities(activities)
          }} />}
          {activeTab === 'analytics' && <Analytics programs={allPrograms} projects={allProjects} activities={allActivities} />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </div>
      <CommandPalette commands={commands} />
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
