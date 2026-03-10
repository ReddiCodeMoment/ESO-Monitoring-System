import '../styles/layout.css'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
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
      </nav>
    </aside>
  )
}
