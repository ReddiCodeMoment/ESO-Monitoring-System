import { useAuth } from '../context/AuthContext'
import '../styles/header.css'

export function Header() {
  const { logout, userEmail } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <div className="header-logo">
            <span className="logo-icon">📊</span>
          </div>
          <h1>ESO Monitoring System</h1>
          <p className="header-subtitle">Extension Services Office</p>
        </div>
        <div className="header-user">
          <div className="user-info">
            <span className="user-email">{userEmail}</span>
            <span className="user-status">Online</span>
          </div>
          <button onClick={logout} className="header-logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
