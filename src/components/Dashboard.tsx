import { useState, useEffect } from 'react'
import { ExtensionProgram } from '../types'
import { getExtensionPrograms, getActivityStats, createExtensionProgram, deleteExtensionProgram } from '../services/extensionService'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import '../styles/layout.css'

export function Dashboard() {
  const { user } = useAuth()
  const { setNotification } = useApp()
  const [programs, setPrograms] = useState<ExtensionProgram[]>([])
  const [showProgramForm, setShowProgramForm] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const [newProgram, setNewProgram] = useState({ title: '', description: '', startDate: today, endDate: today })
  const [stats, setStats] = useState({ totalPrograms: 0, totalActivities: 0, totalBeneficiaries: 0, totalCost: 0 })
  const [selectedProgram, setSelectedProgram] = useState<ExtensionProgram | null>(null)
  const [programStats, setProgramStats] = useState<any>(null)

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const data = await getExtensionPrograms()
      setPrograms(data)
      
      let totalActivities = 0
      let totalBeneficiaries = 0
      let totalCost = 0

      for (const program of data) {
        try {
          const programStats = await getActivityStats(program.id)
          totalActivities += programStats.totalActivities
          totalBeneficiaries += programStats.totalBeneficiaries.total
          totalCost += programStats.totalCost
        } catch (e) {
          // Handle error silently for now
        }
      }

      setStats({
        totalPrograms: data.length,
        totalActivities,
        totalBeneficiaries,
        totalCost,
      })
    } catch (error) {
      console.error('Error loading programs:', error)
    }
  }

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProgram.title.trim()) {
      setNotification({ type: 'error', text: 'Program title is required' })
      return
    }

    try {
      await createExtensionProgram({
        title: newProgram.title,
        description: newProgram.description || '',
        startDate: newProgram.startDate,
        endDate: newProgram.endDate,
        createdBy: user?.id || 'unknown',
        archived: false,
      })
      
      setNotification({ type: 'success', text: 'Program created successfully!' })
      setNewProgram({ title: '', description: '', startDate: today, endDate: today })
      setShowProgramForm(false)
      loadPrograms()
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to create program' })
      console.error('Error creating program:', error)
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



  return (
    <div style={{ padding: '2rem', background: '#f8fafb', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '2px solid #128DA1', paddingBottom: '1.5rem' }}>
        <h1 style={{ color: '#00332B', fontSize: '2.5rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
          Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          Monitor and manage extension programs and activities
        </p>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', borderLeft: '4px solid #128DA1' }}>
          <div style={{ fontSize: '0.85rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            Total Programs
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#128DA1', lineHeight: '1' }}>
            {stats.totalPrograms}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
            Active programs
          </div>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', borderLeft: '4px solid #128DA1' }}>
          <div style={{ fontSize: '0.85rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            Total Activities
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#128DA1', lineHeight: '1' }}>
            {stats.totalActivities}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
            Tracked activities
          </div>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', borderLeft: '4px solid #128DA1' }}>
          <div style={{ fontSize: '0.85rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            Total Beneficiaries
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#128DA1', lineHeight: '1' }}>
            {stats.totalBeneficiaries.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
            People reached
          </div>
        </div>

        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', borderLeft: '4px solid #FF4E69' }}>
          <div style={{ fontSize: '0.85rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            Total Investment
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#FF4E69', lineHeight: '1' }}>
            ${stats.totalCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
            Total cost
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedProgram ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* Left Column - Programs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#00332B', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              Extension Programs
            </h2>
            <button
              onClick={() => setShowProgramForm(!showProgramForm)}
              style={{
                background: showProgramForm ? '#e0f2f1' : '#128DA1',
                color: showProgramForm ? '#128DA1' : 'white',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
              }}
            >
              {showProgramForm ? '✕ Cancel' : '+ New Program'}
            </button>
          </div>

          {/* Create Program Form */}
          {showProgramForm && (
            <form
              onSubmit={handleCreateProgram}
              style={{
                background: 'white',
                padding: '1.75rem',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                marginBottom: '2rem',
                border: '1px solid #e0e0e0',
              }}
            >
              <h3 style={{ color: '#00332B', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '600' }}>
                Create New Program
              </h3>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Program Title Field */}
                <div>
                  <label style={{ display: 'block', color: '#00332B', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    Program Title <span style={{ color: '#FF4E69' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Community Health Program 2026"
                    value={newProgram.title}
                    onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>The name of your extension program</p>
                </div>

                {/* Description Field */}
                <div>
                  <label style={{ display: 'block', color: '#00332B', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    Description <span style={{ color: '#999' }}>(Optional)</span>
                  </label>
                  <textarea
                    placeholder="Describe the program's goals, target beneficiaries, activities, etc."
                    value={newProgram.description}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      minHeight: '100px',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>Provide details about the program scope and objectives</p>
                </div>

                {/* Year Range Fields */}
                <div>
                  <label style={{ display: 'block', color: '#00332B', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                    Program Duration
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#555', fontWeight: '500', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newProgram.startDate}
                        onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#555', fontWeight: '500', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newProgram.endDate}
                        onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#999' }}>Specify when the program runs</p>
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: '#128DA1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#0e7a8a'
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#128DA1'
                  }}
                >
                  Create Program
                </button>
              </div>
            </form>
          )}

          {/* Programs List */}
          {programs.length === 0 ? (
            <div
              style={{
                background: 'white',
                padding: '3rem 2rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#999',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                border: '1px solid #e0e0e0',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📋</div>
              <p>No programs yet. Click "New Program" to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {programs.map((program) => (
                <div
                  key={program.id}
                  onClick={() => handleSelectProgram(program)}
                  style={{
                    background: selectedProgram?.id === program.id ? '#e0f2f1' : 'white',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    border: selectedProgram?.id === program.id ? '2px solid #128DA1' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedProgram?.id === program.id ? '0 4px 16px rgba(18,141,161,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (selectedProgram?.id !== program.id) {
                      (e.currentTarget as HTMLElement).style.borderColor = '#128DA1';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(18,141,161,0.1)'
                    }
                  }}
                  onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
                    if (selectedProgram?.id !== program.id) {
                      (e.currentTarget as HTMLElement).style.borderColor = '#e0e0e0';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <div style={{ fontWeight: '700', color: '#00332B', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                    {program.title}
                  </div>
                  {program.description && (
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.75rem' }}>
                      {program.description}
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#999', display: 'flex', gap: '1rem' }}>
                    <span>📅 {new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Program Details */}
        {selectedProgram && programStats && (
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0',
              height: 'fit-content',
              position: 'sticky',
              top: '2rem',
            }}
          >
            <h3
              style={{
                color: '#00332B',
                fontSize: '1.4rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '2px solid #128DA1',
              }}
            >
              {selectedProgram.title}
            </h3>

            {/* Program Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: '600', marginBottom: '0.5rem' }}>
                  ACTIVITIES
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#128DA1' }}>
                  {programStats.totalActivities}
                </div>
              </div>
              <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: '600', marginBottom: '0.5rem' }}>
                  BENEFICIARIES
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#128DA1' }}>
                  {programStats.totalBeneficiaries.total}
                </div>
              </div>
              <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: '600', marginBottom: '0.5rem' }}>
                  SDGs
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#128DA1' }}>
                  {programStats.sdgsInvolved.length}
                </div>
              </div>
              <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#999', fontWeight: '600', marginBottom: '0.5rem' }}>
                  COST
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FF4E69' }}>
                  ${(programStats.totalCost / 1000).toFixed(1)}k
                </div>
              </div>
            </div>

            {/* SDGs */}
            {programStats.sdgsInvolved.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#00332B', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '600' }}>
                  SDGs Involved
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {programStats.sdgsInvolved.map((sdg: string) => (
                    <span
                      key={sdg}
                      style={{
                        background: '#128DA1',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}
                    >
                      SDG {sdg}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <a
                href="#/data"
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  background: '#128DA1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#0e7a8a'
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#128DA1'
                }}
              >
                Manage Activities
              </a>
              <button
                onClick={() => {
                  if (window.confirm('Delete this program?')) {
                    deleteExtensionProgram(selectedProgram.id).then(() => {
                      loadPrograms()
                      setSelectedProgram(null)
                      setNotification({ type: 'success', text: 'Program deleted' })
                    })
                  }
                }}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#FF4E69',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.9'
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '1'
                }}
              >
                Delete Program
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
