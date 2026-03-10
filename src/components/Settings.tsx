import { useState } from 'react'
import '../styles/settings.css'

export function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState(true)

  const handleExportData = () => {
    alert('Data export feature coming soon!')
  }

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear cache? This cannot be undone.')) {
      localStorage.clear()
      alert('Cache cleared successfully!')
    }
  }

  return (
    <div className="content-section">
      <h2>Settings</h2>

      {/* Preferences Section */}
      <div className="settings-section">
        <h3>Preferences</h3>
        <div className="settings-group">
          <label>
            <span className="setting-label">Theme</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="setting-input"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>

        <div className="settings-group">
          <label>
            <span className="setting-label">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="setting-input"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="tl">Tagalog</option>
            </select>
          </label>
        </div>

        <div className="settings-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="checkbox-input"
            />
            <span className="setting-label">Enable Notifications</span>
          </label>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="settings-section">
        <h3>Data Management</h3>
        <p className="section-description">
          Manage your data and export options.
        </p>

        <div className="settings-actions">
          <button
            onClick={handleExportData}
            className="settings-button settings-button-primary"
          >
            📥 Export Data
          </button>
          <button
            onClick={handleClearCache}
            className="settings-button settings-button-danger"
          >
            🗑️ Clear Cache
          </button>
        </div>

        <div className="data-info">
          <h4>Data Storage Information</h4>
          <ul>
            <li>Database: Firestore</li>
            <li>Storage Location: Multi-region</li>
            <li>Last Sync: Just now</li>
            <li>Cache Size: ~2.5 MB</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
