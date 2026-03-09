import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/login.css'

export function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>ESO Monitoring System</h1>
          <p>Extension Services Office Activity Tracker</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
          >
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
            Secure login for authorized personnel only
          </p>
        </div>
      </div>
    </div>
  )
}
