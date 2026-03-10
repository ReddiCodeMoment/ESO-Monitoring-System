import { useState, useEffect } from 'react'
import { ExtensionProgram, Project, Activity } from '../types'
import { getExtensionPrograms, createActivity, updateActivity, createProject, getProjectsByProgramId } from '../services/extensionService'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ActivityForm } from './ActivityForm'
import { ActivityList } from './ActivityList'

export function DataManagement() {
  const { setNotification } = useApp()
  const { user } = useAuth()
  const [programs, setPrograms] = useState<ExtensionProgram[]>([])
  const [selectedProgram, setSelectedProgram] = useState<ExtensionProgram | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [view, setView] = useState<'list' | 'form' | 'createProject'>('list')
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  useEffect(() => {
    loadPrograms()
  }, [])

  useEffect(() => {
    if (selectedProgram) {
      loadProjects()
    }
  }, [selectedProgram])

  const loadPrograms = async () => {
    try {
      const data = await getExtensionPrograms()
      setPrograms(data)
      if (data.length > 0) {
        setSelectedProgram(data[0])
      }
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to load programs' })
      console.error('Error:', error)
    }
  }

  const loadProjects = async () => {
    if (!selectedProgram) return
    try {
      const data = await getProjectsByProgramId(selectedProgram.id)
      setProjects(data)
      if (data.length > 0) {
        setSelectedProject(data[0])
      } else {
        setSelectedProject(null)
      }
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to load projects' })
      console.error('Error:', error)
    }
  }

  const handleCreateProject = async () => {
    if (!selectedProgram || !newProjectName.trim()) {
      setNotification({ type: 'error', text: 'Project name is required' })
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      await createProject(selectedProgram.id, {
        title: newProjectName,
        description: newProjectDescription,
        startDate: today,
        endDate: today,
        createdBy: user?.id || 'unknown',
        archived: false,
      })
      setNotification({ type: 'success', text: 'Project created successfully!' })
      setNewProjectName('')
      setNewProjectDescription('')
      setView('list')
      loadProjects()
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to create project' })
      console.error('Error:', error)
    }
  }

  const handleSubmitActivity = async (formData: any) => {
    if (!selectedProgram || !selectedProject) return

    try {
      if (editingActivity) {
        // Update existing activity
        await updateActivity(selectedProgram.id, selectedProject.id, editingActivity.id, {
          title: formData.title,
          location: formData.location,
          startDate: formData.startDate,
          endDate: formData.endDate,
          extensionAgenda: formData.extensionAgenda,
          duration: formData.duration,
          sdgInvolved: formData.sdgInvolved,
          implementingCollege: formData.implementingCollege,
          programsInvolved: formData.programsInvolved,
          facultyExtensionists: formData.facultyExtensionists,
          partnerAgency: formData.partnerAgency,
          typeOfPartner: formData.typeOfPartner,
          supportProvided: formData.supportProvided,
          totalCost: parseInt(formData.totalCost),
          sourceOfFund: formData.sourceOfFund,
          typeOfParticipant: formData.typeOfParticipant,
          beneficiaries: {
            male: parseInt(formData.beneficiaries.male),
            female: parseInt(formData.beneficiaries.female),
            total: parseInt(formData.beneficiaries.total),
          },
        })
        setNotification({ type: 'success', text: 'Activity updated successfully!' })
      } else {
        // Create new activity
        await createActivity(selectedProgram.id, selectedProject.id, {
          title: formData.title,
          location: formData.location,
          startDate: formData.startDate,
          endDate: formData.endDate,
          extensionAgenda: formData.extensionAgenda,
          duration: formData.duration,
          sdgInvolved: formData.sdgInvolved,
          implementingCollege: formData.implementingCollege,
          programsInvolved: formData.programsInvolved,
          facultyExtensionists: formData.facultyExtensionists,
          partnerAgency: formData.partnerAgency,
          typeOfPartner: formData.typeOfPartner,
          supportProvided: formData.supportProvided,
          totalCost: parseInt(formData.totalCost),
          sourceOfFund: formData.sourceOfFund,
          typeOfParticipant: formData.typeOfParticipant,
          beneficiaries: {
            male: parseInt(formData.beneficiaries.male),
            female: parseInt(formData.beneficiaries.female),
            total: parseInt(formData.beneficiaries.total),
          },
          createdBy: user?.id || 'unknown',
          status: 'draft',
        })
        setNotification({ type: 'success', text: 'Activity created successfully!' })
      }

      setView('list')
      setEditingActivity(null)
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to save activity' })
      console.error('Error:', error)
    }
  }

  if (!selectedProgram) {
    return (
      <div className="data-container" style={{ padding: '2rem' }}>
        <p>No programs available. Create a program in the Dashboard first.</p>
      </div>
    )
  }

  return (
    <div className="data-container" style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', color: '#00332B' }}>Activity Management</h2>
        
        {/* Program Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#00332B' }}>
            Select Program:
          </label>
          <select
            value={selectedProgram.id}
            onChange={(e) => {
              const program = programs.find((p) => p.id === e.target.value)
              if (program) setSelectedProgram(program)
            }}
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              minWidth: '300px',
            }}
          >
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
        </div>

        {/* Project Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#00332B' }}>
            Select Project:
          </label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value)
                if (project) setSelectedProject(project)
              }}
              style={{
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                minWidth: '300px',
              }}
            >
              <option value="">-- Select or Create a Project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => setView('createProject')}
              style={{
                padding: '0.75rem 1rem',
                background: '#128DA1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              + New Project
            </button>
          </div>
        </div>
      </div>

      {view === 'createProject' ? (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#00332B' }}>Create New Project</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Project Name:</label>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
              }}
              placeholder="Enter project name"
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Description (optional):</label>
            <textarea
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                minHeight: '100px',
              }}
              placeholder="Enter project description"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleCreateProject}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#128DA1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Create Project
            </button>
            <button
              onClick={() => setView('list')}
              style={{
                padding: '0.75rem 1rem',
                background: '#f0f0f0',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : view === 'list' ? (
        <div>
          {selectedProject ? (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <button
                  onClick={() => {
                    setEditingActivity(null)
                    setView('form')
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#128DA1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  + New Activity
                </button>
              </div>

              <ActivityList
                programId={selectedProgram.id}
                projectId={selectedProject.id}
                onEdit={(activity) => {
                  setEditingActivity(activity)
                  setView('form')
                }}
              />
            </>
          ) : (
            <div style={{ padding: '2rem', background: '#f5f5f5', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
              Please select or create a project to manage activities.
            </div>
          )}
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setEditingActivity(null)
              setView('list')
            }}
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ← Back to List
          </button>

          {selectedProject && (
            <ActivityForm
              initialData={editingActivity || undefined}
              onSubmit={handleSubmitActivity}
              onCancel={() => {
                setEditingActivity(null)
                setView('list')
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
