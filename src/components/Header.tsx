import { useAuth } from '../context/AuthContext'
import '../styles/header.css'

export function Header() {
  const { logout, userEmail } = useAuth()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <h1>ESO Monitoring System</h1>
        </div>
        <div className="header-user">
          <span>{userEmail}</span>
          <button onClick={logout} className="header-logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
