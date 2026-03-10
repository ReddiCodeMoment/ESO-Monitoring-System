import { useAuth } from '../context/AuthContext'
import '../styles/header.css'

interface HeaderProps {
  activeTab?: 'dashboard' | 'data' | 'settings'
  onTabChange?: (tab: 'dashboard' | 'data' | 'settings') => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const { logout, user } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <h1>ESO Monitoring System</h1>
        </div>
        <div className="header-user">
          <span>{user?.email}</span>
          <button
            onClick={() => onTabChange?.('settings')}
            className={`header-icon-btn ${activeTab === 'settings' ? 'active' : ''}`}
            title="Settings"
            aria-label="Settings"
          >
            ⚙️
          </button>
          <button onClick={logout} className="header-icon-btn" title="Logout" aria-label="Logout">
            🚪
          </button>
        </div>
      </div>
    </header>
  )
}
