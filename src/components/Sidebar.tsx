import '../styles/layout.css'

type Tab = 'dashboard' | 'data' | 'settings'

interface SidebarProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`sidebar-nav-item ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => onTabChange('data')}
        >
          📋 Data
        </button>
        <button
          className={`sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>
    </aside>
  )
}
