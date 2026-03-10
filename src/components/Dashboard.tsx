import { useState, useEffect } from 'react'
import { ExtensionProgram, SDG_LIST } from '../types'
import { getExtensionPrograms, getActivityStats } from '../services/extensionService'
import '../styles/layout.css'

export function Dashboard() {
  const [programs, setPrograms] = useState<ExtensionProgram[]>([])
  const [stats, setStats] = useState({ totalPrograms: 0, totalActivities: 0, totalBeneficiaries: 0, totalCost: 0 })
  const [selectedProgram, setSelectedProgram] = useState<ExtensionProgram | null>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
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

  const handleSelectProgram = async (program: ExtensionProgram | null) => {
    setSelectedProgram(program)
    setSelectedProject(null)
    setSelectedActivity(null)
    if (!program) {
      setProgramStats(null)
      return
    }
    try {
      const stats = await getActivityStats(program.id)
      setProgramStats(stats)
    } catch (error) {
      console.error('Error loading program stats:', error)
      setProgramStats({
        totalActivities: 0,
        totalBeneficiaries: { male: 0, female: 0, total: 0 },
        totalCost: 0,
        sdgCoverage: 0,
        activitiesCount: 0,
        sdgsInvolved: [],
        statuses: {},
      })
    }
  }

  // Get displayed stats based on selection level
  const getDisplayedStats = () => {
    if (selectedActivity) {
      return {
        totalActivities: 1,
        totalBeneficiaries: selectedActivity.beneficiaries || { male: 0, female: 0, total: 0 },
        totalCost: selectedActivity.totalCost || 0,
        sdgsInvolved: selectedActivity.sdgInvolved || [],
      }
    }

    if (selectedProject) {
      let projActivities = 0
      let projBeneficiaries = { male: 0, female: 0, total: 0 }
      let projCost = 0
      const projSDGs = new Set<string>()

      selectedProject.activities?.forEach((activity: any) => {
        projActivities += 1
        projBeneficiaries.male += activity.beneficiaries?.male || 0
        projBeneficiaries.female += activity.beneficiaries?.female || 0
        projBeneficiaries.total += activity.beneficiaries?.total || 0
        projCost += activity.totalCost || 0
        activity.sdgInvolved?.forEach((sdg: string) => projSDGs.add(sdg))
      })

      return {
        totalActivities: projActivities,
        totalBeneficiaries: projBeneficiaries,
        totalCost: projCost,
        sdgsInvolved: Array.from(projSDGs),
      }
    }

    return programStats
  }

  const displayedStats = getDisplayedStats()



  return (
    <div style={{ padding: '1rem', background: '#f8fafb', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1rem', borderBottom: '2px solid #128DA1', paddingBottom: '0.75rem' }}>
        <h1 style={{ color: '#00332B', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.2rem 0' }}>
          Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>
          Monitor and manage extension programs and activities
        </p>
      </div>

      {/* Statistics Cards - Overall Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', borderLeft: '4px solid #128DA1' }}>
          <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
            Total Programs
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#128DA1', lineHeight: '1' }}>
            {stats.totalPrograms}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>
            Active programs
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', borderLeft: '4px solid #128DA1' }}>
          <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
            Total Activities
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#128DA1', lineHeight: '1' }}>
            {stats.totalActivities}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>
            Tracked activities
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', borderLeft: '4px solid #128DA1' }}>
          <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
            Total Beneficiaries
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#128DA1', lineHeight: '1' }}>
            {stats.totalBeneficiaries.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>
            People reached
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', borderLeft: '4px solid #FF4E69' }}>
          <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
            Total Investment
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#FF4E69', lineHeight: '1' }}>
            ${stats.totalCost.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.2rem' }}>
            Total cost
          </div>
        </div>
      </div>

      {/* Program Filter Section */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00332B', fontWeight: '600', fontSize: '0.85rem' }}>
          Select a Program to View Details
        </label>
        <select
          value={selectedProgram?.id || ''}
          onChange={(e) => {
            const program = programs.find(p => p.id === e.target.value) || null
            if (program) {
              handleSelectProgram(program)
            } else {
              setSelectedProgram(null)
              setProgramStats(null)
            }
          }}
          style={{
            width: '100%',
            padding: '0.45rem 0.75rem',
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: 'white',
            color: '#333',
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          }}
          onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
            const target = e.currentTarget as HTMLSelectElement;
            (target as HTMLElement).style.borderColor = '#128DA1';
            (target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(18,141,161,0.1)';
          }}
          onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
            const target = e.currentTarget as HTMLSelectElement;
            (target as HTMLElement).style.borderColor = '#ddd';
            (target as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <option value="">-- Select a Program --</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.title}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Program Details */}
      {selectedProgram && programStats && (
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e0e0e0',
            borderLeft: `5px solid ${selectedProgram.color || '#128DA1'}`,
          }}
        >
          {/* Program Header */}
          <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f0f0f0' }}>
            <h3
              style={{
                color: '#00332B',
                fontSize: '1.1rem',
                fontWeight: '700',
                margin: '0 0 0.2rem 0',
              }}
            >
              {selectedProgram.title}
              {selectedActivity && ` > ${selectedProject?.title} > ${selectedActivity.title}`}
              {!selectedActivity && selectedProject && ` > ${selectedProject.title}`}
            </h3>
            {selectedProgram.description && !selectedProject && (
              <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>
                {selectedProgram.description}
              </p>
            )}
            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.2rem' }}>
              📅 {new Date(selectedProgram.startDate).toLocaleDateString()} - {new Date(selectedProgram.endDate).toLocaleDateString()}
              {selectedProgram.implementingCollege && (
                <span style={{ marginLeft: '1rem' }}>🏫 {selectedProgram.implementingCollege}</span>
              )}
            </div>
          </div>

          {/* Project Selector */}
          {selectedProgram.projects && selectedProgram.projects.length > 0 && (
            <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #e0e0e0' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#00332B', fontWeight: '600', fontSize: '0.8rem' }}>
                Select a Project (Optional)
              </label>
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = selectedProgram.projects?.find(p => p.id === e.target.value) || null
                  setSelectedProject(project)
                  setSelectedActivity(null)
                }}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  color: '#333',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <option value="">-- All Projects --</option>
                {selectedProgram.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Activity Selector (only show if project is selected) */}
          {selectedProject && selectedProject.activities && selectedProject.activities.length > 0 && (
            <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid #e0e0e0' }}>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#00332B', fontWeight: '600', fontSize: '0.8rem' }}>
                Select an Activity (Optional)
              </label>
              <select
                value={selectedActivity?.id || ''}
                onChange={(e) => {
                  const activity = selectedProject.activities?.find((a: any) => a.id === e.target.value) || null
                  setSelectedActivity(activity)
                }}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  color: '#333',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'border-color 0.3s ease',
                }}
              >
                <option value="">-- All Activities --</option>
                {selectedProject.activities.map((activity: any) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Program Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Total Activities
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#128DA1' }}>
                {displayedStats?.totalActivities || 0}
              </div>
            </div>
            <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Total Beneficiaries
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#128DA1' }}>
                {(displayedStats?.totalBeneficiaries?.total || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#999', marginTop: '0.2rem' }}>
                👨 {displayedStats?.totalBeneficiaries?.male || 0} | 👩 {displayedStats?.totalBeneficiaries?.female || 0}
              </div>
            </div>
            <div style={{ background: '#f8fafb', padding: '1rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Total Investment
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#FF4E69' }}>
                ${((displayedStats?.totalCost || 0) / 1000).toFixed(1)}k
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: '#f8fafb', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e0e0e0' }}>
              <div style={{ fontSize: '0.65rem', color: '#999', fontWeight: '600' }}>SDGs COVERED</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#128DA1', marginTop: '0.2rem' }}>
                {displayedStats?.sdgsInvolved?.length || 0}
              </div>
            </div>
          </div>

          {/* SDGs */}
          {displayedStats?.sdgsInvolved && displayedStats.sdgsInvolved.length > 0 && (
            <div style={{ marginBottom: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
              <h4 style={{ color: '#00332B', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: '600' }}>
                Sustainable Development Goals
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {displayedStats.sdgsInvolved.map((sdgId: string) => {
                  const sdg = SDG_LIST.find(s => s.id === sdgId)
                  return (
                    <div
                      key={sdgId}
                      style={{
                        background: sdg?.color || '#999',
                        color: 'white',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <span style={{ fontWeight: '700', fontSize: '0.75rem' }}>SDG {sdgId}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.95 }}>{sdg?.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div>
            <a
              href="#/data"
              style={{
                display: 'inline-block',
                padding: '0.45rem 0.9rem',
                background: '#128DA1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.8rem',
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
              Manage Activities & Projects
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
