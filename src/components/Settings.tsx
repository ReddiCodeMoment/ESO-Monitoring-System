import { useState, useEffect } from 'react'
import { useNotification } from '../context/NotificationContext'
import { getExtensionPrograms } from '../services/extensionService'
import '../styles/settings.css'

export function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [exporting, setExporting] = useState(false)
  const { showSuccess, showError, showInfo } = useNotification()

  // Initialize theme from localStorage on first load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
      const initialTheme = stored === 'dark' || stored === 'light' ? stored : 'light'
      setTheme(initialTheme)
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark-mode')
      } else {
        document.documentElement.classList.remove('dark-mode')
      }
    } catch {
      // Fallback to light if storage isn't available
      document.documentElement.classList.remove('dark-mode')
    }
  }, [])

  // Apply theme changes and persist choice
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Ignore storage errors
    }
  }, [theme])

  const handleExportData = async () => {
    setExporting(true)
    try {
      showInfo('Exporting', 'Preparing your data...')
      const programs = await getExtensionPrograms()
      const dataStr = JSON.stringify(programs, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `eso-data-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
      showSuccess('Export completed', `Data exported successfully`)
    } catch (error) {
      showError('Export failed', 'Could not export data')
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear cache? This cannot be undone.')) {
      localStorage.clear()
      showSuccess('Cache cleared', 'Local cache has been removed')
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
        <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
          Notifications are enabled by default and will appear in the top-right corner when you perform actions.
        </p>
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
            disabled={exporting}
            className="settings-button settings-button-primary"
            style={{ opacity: exporting ? 0.6 : 1, cursor: exporting ? 'not-allowed' : 'pointer' }}
          >
            {exporting ? '⏳ Exporting...' : '📥 Export Data'}
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
