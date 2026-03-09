import { useState, useEffect } from 'react'
import { ExtensionProgram, Activity } from '../types'
import { getExtensionPrograms, getActivities, getActivityStats, createExtensionProgram, deleteExtensionProgram } from '../services/extensionService'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import '../styles/layout.css'

export function Dashboard() {
  const { user } = useAuth()
  const { setNotification } = useApp()
  const [programs, setPrograms] = useState<ExtensionProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [showProgramForm, setShowProgramForm] = useState(false)
  const [newProgram, setNewProgram] = useState({ title: '', description: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() })
  const [stats, setStats] = useState({ totalPrograms: 0, totalActivities: 0, totalBeneficiaries: 0, totalCost: 0 })
  const [selectedProgram, setSelectedProgram] = useState<ExtensionProgram | null>(null)
  const [programStats, setProgramStats] = useState<any>(null)

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      setLoading(true)
      const data = await getExtensionPrograms()
      setPrograms(data)
      
      // Calculate overall stats
      let totalActivities = 0
      let totalBeneficiaries = 0
      let totalCost = 0

      for (const program of data) {
        const activities = await getActivities(program.id)
        totalActivities += activities.length
        totalBeneficiaries += activities.reduce((sum, a) => sum + a.beneficiaries.total, 0)
        totalCost += activities.reduce((sum, a) => sum + a.totalCost, 0)
      }

      setStats({
        totalPrograms: data.length,
        totalActivities,
        totalBeneficiaries,
        totalCost,
      })
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to load programs' })
      console.error('Error loading programs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProgram.title.trim()) {
      setNotification({ type: 'error', text: 'Program title is required' })
      return
    }

    try {
      const programId = await createExtensionProgram({
        title: newProgram.title,
        description: newProgram.description || '',
        startYear: newProgram.startYear,
        endYear: newProgram.endYear,
        activities: [],
        createdBy: user?.id || 'unknown',
        archived: false,
      })
      
      setNotification({ type: 'success', text: 'Program created successfully!' })
      setNewProgram({ title: '', description: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() })
      setShowProgramForm(false)
      loadPrograms()
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to create program' })
      console.error('Error creating program:', error)
    }
  }

  const handleDeleteProgram = async (programId: string) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return

    try {
      await deleteExtensionProgram(programId)
      setNotification({ type: 'success', text: 'Program deleted successfully' })
      loadPrograms()
      setSelectedProgram(null)
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to delete program' })
      console.error('Error deleting program:', error)
    }
  }

  const handleSelectProgram = async (program: ExtensionProgram) => {
    setSelectedProgram(program)
    try {
      const stats = await getActivityStats(program.id)
      setProgramStats(stats)
    } catch (error) {
      console.error('Error loading program stats:', error)
    }
  }

  if (loading) {
    return <div className="dashboard-container"><p>Loading programs...</p></div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h2>Dashboard</h2>
            <p className="text-gray-600">Welcome back! Manage your extension programs and activities.</p>
          </div>
          <button
            onClick={() => setShowProgramForm(!showProgramForm)}
            className="btn-primary"
            style={{ background: '#128DA1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
          >
            {showProgramForm ? 'Cancel' : '+ New Program'}
          </button>
        </div>

        {/* Create Program Form */}
        {showProgramForm && (
          <div className="form-panel" style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e0e0e0' }}>
            <h3>Create New Program</h3>
            <form onSubmit={handleCreateProgram} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Program Title"
                value={newProgram.title}
                onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newProgram.description}
                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="Start Year"
                value={newProgram.startYear}
                onChange={(e) => setNewProgram({ ...newProgram, startYear: parseInt(e.target.value) })}
                style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <input
                type="number"
                placeholder="End Year"
                value={newProgram.endYear}
                onChange={(e) => setNewProgram({ ...newProgram, endYear: parseInt(e.target.value) })}
                style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }}
              />
              <button
                type="submit"
                style={{ gridColumn: '1 / -1', padding: '0.75rem', background: '#128DA1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                Create Program
              </button>
            </form>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Total Programs</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#128DA1' }}>{stats.totalPrograms}</div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Total Activities</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#128DA1' }}>{stats.totalActivities}</div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Total Beneficiaries</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#128DA1' }}>{stats.totalBeneficiaries.toLocaleString()}</div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Total Cost</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#128DA1' }}>${stats.totalCost.toLocaleString()}</div>
          </div>
        </div>

        {/* Programs Section */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedProgram ? '1fr 1fr' : '1fr', gap: '2rem' }}>
          {/* Programs List */}
          <div>
            <h3 style={{ marginBottom: '1rem', color: '#00332B', fontSize: '1.25rem', fontWeight: '600' }}>Extension Programs</h3>
            {programs.length === 0 ? (
              <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
                No programs yet. Click "New Program" to get started.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {programs.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => handleSelectProgram(program)}
                    style={{
                      background: selectedProgram?.id === program.id ? '#e0f2f1' : 'white',
                      padding: '1.25rem',
                      borderRadius: '8px',
                      border: selectedProgram?.id === program.id ? '2px solid #128DA1' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={(e) => !selectedProgram && (e.currentTarget.style.borderColor = '#128DA1')}
                    onMouseOut={(e) => !selectedProgram && (e.currentTarget.style.borderColor = '#e0e0e0')}
                  >
                    <div style={{ fontWeight: '600', color: '#00332B', marginBottom: '0.5rem' }}>{program.title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{program.description}</div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>
                      {program.startYear} - {program.endYear}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Program Details */}
          {selectedProgram && programStats && (
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
              <h3 style={{ marginBottom: '1rem', color: '#00332B', fontSize: '1.25rem', fontWeight: '600' }}>
                {selectedProgram.title}
              </h3>

              {/* Program Stats */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#128DA1', marginBottom: '1rem', fontWeight: '600' }}>Statistics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Activities</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#128DA1' }}>
                      {programStats.totalActivities}
                    </div>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Beneficiaries</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#128DA1' }}>
                      {programStats.totalBeneficiaries.total}
                    </div>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>SDG Count</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#128DA1' }}>
                      {programStats.sdgsInvolved.length}
                    </div>
                  </div>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Total Cost</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#128DA1' }}>
                      ${programStats.totalCost.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* SDGs Involved */}
              {programStats.sdgsInvolved.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#128DA1', marginBottom: '0.75rem', fontWeight: '600' }}>SDGs Involved</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {programStats.sdgsInvolved.map((sdg) => (
                      <span
                        key={sdg}
                        style={{
                          background: '#128DA1',
                          color: 'white',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                        }}
                      >
                        SDG {sdg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Status Breakdown */}
              {Object.keys(programStats.statuses).length > 0 && (
                <div>
                  <h4 style={{ color: '#128DA1', marginBottom: '0.75rem', fontWeight: '600' }}>Activity Status</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {Object.entries(programStats.statuses).map(([status, count]: any) => (
                      <div key={status} style={{ fontSize: '0.9rem', color: '#666' }}>
                        <span style={{ textTransform: 'capitalize' }}>{status}</span>: <strong>{count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => window.location.hash = '#/data'}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: '#128DA1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: 1,
                  }}
                >
                  Manage Activities
                </button>
                <button
                  onClick={() => handleDeleteProgram(selectedProgram.id)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: '#FF4E69',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: 1,
                  }}
                >
                  Delete Program
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
