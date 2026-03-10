import { useState, useEffect } from 'react'
import { ExtensionProgram, Project, Activity, SDG_LIST } from '../types'
import { 
  getExtensionPrograms, 
  createActivity, 
  updateActivity, 
  createProject, 
  getProjectsByProgramId,
  createExtensionProgram,
  getActivitiesByProjectId,
  deleteActivity,
  deleteExtensionProgram,
  deleteProject,
  updateExtensionProgram,
  updateProject
} from '../services/extensionService'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ActivityForm } from './ActivityForm'

export function DataManagement() {
  const { setNotification } = useApp()
  const { user } = useAuth()
  
  // Data states
  const [programs, setPrograms] = useState<ExtensionProgram[]>([])
  const [projects, setProjects] = useState<Map<string, Project[]>>(new Map())
  const [activities, setActivities] = useState<Map<string, Activity[]>>(new Map())
  
  // Selection states
  const [selectedProgram, setSelectedProgram] = useState<ExtensionProgram | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  // UI states
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set())
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'list' | 'form' | 'createProgram' | 'createProject' | 'createActivity' | 'editProgram' | 'editProject'>('list')
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editingProgram, setEditingProgram] = useState<ExtensionProgram | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [infoModal, setInfoModal] = useState<{ type: 'program' | 'project' | 'activity', data: any } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form states
  const [newProgram, setNewProgram] = useState({ title: '', description: '', startDate: '', endDate: '' })
  const [newProject, setNewProject] = useState({ title: '', description: '', startDate: '', endDate: '' })

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const data = await getExtensionPrograms()
      setPrograms(data)
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to load programs' })
      console.error('Error:', error)
    }
  }

  const toggleProgram = (programId: string) => {
    const newExpanded = new Set(expandedPrograms)
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId)
    } else {
      newExpanded.add(programId)
      // Load projects if not already loaded
      loadProjectsForProgram(programId)
    }
    setExpandedPrograms(newExpanded)
  }

  const loadProjectsForProgram = async (programId: string) => {
    if (projects.has(programId)) return
    try {
      const data = await getProjectsByProgramId(programId)
      setProjects(new Map(projects).set(programId, data))
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const loadAllProjects = async () => {
    try {
      for (const program of programs) {
        if (!projects.has(program.id)) {
          const data = await getProjectsByProgramId(program.id)
          setProjects((prev) => new Map(prev).set(program.id, data))
        }
      }
    } catch (error) {
      console.error('Error loading all projects:', error)
    }
  }

  useEffect(() => {
    if (view === 'createActivity' && programs.length > 0) {
      loadAllProjects()
    }
  }, [view, programs])

  const loadActivitiesForProject = async (programId: string, projectId: string) => {
    const key = `${programId}-${projectId}`
    if (activities.has(key)) return
    try {
      const data = await getActivitiesByProjectId(programId, projectId)
      setActivities((prev) => new Map(prev).set(key, data))
    } catch (error) {
      console.error('Error loading activities:', error)
    }
  }

  const toggleProject = (projectId: string, programId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
      // Load activities when expanding project
      loadActivitiesForProject(programId, projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const handleCreateProgram = async () => {
    if (!newProgram.title.trim()) {
      setNotification({ type: 'error', text: 'Program title is required' })
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      await createExtensionProgram({
        title: newProgram.title,
        description: newProgram.description,
        startDate: newProgram.startDate || today,
        endDate: newProgram.endDate || today,
        createdBy: user?.id || 'unknown',
        archived: false,
      })
      setNotification({ type: 'success', text: 'Program created successfully!' })
      setNewProgram({ title: '', description: '', startDate: '', endDate: '' })
      setView('list')
      loadPrograms()
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to create program' })
      console.error('Error:', error)
    }
  }

  const handleCreateProject = async () => {
    if (!selectedProgram || !newProject.title.trim()) {
      setNotification({ type: 'error', text: 'Program and project name are required' })
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      await createProject(selectedProgram.id, {
        title: newProject.title,
        description: newProject.description,
        startDate: newProject.startDate || today,
        endDate: newProject.endDate || today,
        createdBy: user?.id || 'unknown',
        archived: false,
      })
      setNotification({ type: 'success', text: 'Project created successfully!' })
      setNewProject({ title: '', description: '', startDate: '', endDate: '' })
      setView('list')
      // Reload projects for this program
      projects.delete(selectedProgram.id)
      loadProjectsForProgram(selectedProgram.id)
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to create project' })
      console.error('Error:', error)
    }
  }

  const handleEditProgram = async () => {
    if (!editingProgram || !editingProgram.title.trim()) {
      setNotification({ type: 'error', text: 'Program title is required' })
      return
    }

    try {
      await updateExtensionProgram(editingProgram.id, {
        title: editingProgram.title,
        description: editingProgram.description,
        startDate: editingProgram.startDate,
        endDate: editingProgram.endDate,
      })
      setNotification({ type: 'success', text: 'Program updated successfully!' })
      setEditingProgram(null)
      setView('list')
      loadPrograms()
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to update program' })
      console.error('Error:', error)
    }
  }

  const handleEditProject = async () => {
    if (!selectedProgram || !editingProject || !editingProject.title.trim()) {
      setNotification({ type: 'error', text: 'Project name is required' })
      return
    }

    try {
      await updateProject(selectedProgram.id, editingProject.id, {
        title: editingProject.title,
        description: editingProject.description,
        startDate: editingProject.startDate,
        endDate: editingProject.endDate,
      })
      setNotification({ type: 'success', text: 'Project updated successfully!' })
      setEditingProject(null)
      setView('list')
      // Reload projects for this program
      projects.delete(selectedProgram.id)
      loadProjectsForProgram(selectedProgram.id)
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to update project' })
      console.error('Error:', error)
    }
  }

  const handleSubmitActivity = async (formData: any) => {
    if (!selectedProgram || !selectedProject) return

    try {
      if (editingActivity) {
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
      // Reload projects
      if (selectedProgram) {
        projects.delete(selectedProgram.id)
        loadProjectsForProgram(selectedProgram.id)
      }
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to save activity' })
      console.error('Error:', error)
    }
  }

  // Return TSX
  const programProjects = selectedProgram ? projects.get(selectedProgram.id) || [] : []

  // Search/Filter logic
  const searchLower = searchTerm.toLowerCase().trim()
  const matchesSearch = (text: string): boolean => text.toLowerCase().includes(searchLower)
  
  const filteredPrograms = searchLower === ''
    ? programs
    : programs.filter((program) => {
        const programMatches = matchesSearch(program.title) || matchesSearch(program.description || '')
        if (programMatches) return true
        
        const projectsInProgram = projects.get(program.id) || []
        const projectMatches = projectsInProgram.some((proj) => {
          const projMatches = matchesSearch(proj.title) || matchesSearch(proj.description || '')
          if (projMatches) return true
          
          const activitiesInProject = activities.get(proj.id) || []
          return activitiesInProject.some((act) => matchesSearch(act.title) || matchesSearch(act.location || ''))
        })
        
        return projectMatches
      })
  
  // Auto-expand programs/projects that have search matches
  const getAutoExpandedPrograms = (): Set<string> => {
    if (searchLower === '') return expandedPrograms
    
    const expandedIds = new Set<string>()
    filteredPrograms.forEach((program) => {
      const projectsInProgram = projects.get(program.id) || []
      const hasMatchingProjects = projectsInProgram.some((proj) => {
        const projMatches = matchesSearch(proj.title) || matchesSearch(proj.description || '')
        if (projMatches) return true
        
        const activitiesInProject = activities.get(proj.id) || []
        return activitiesInProject.some((act) => matchesSearch(act.title) || matchesSearch(act.location || ''))
      })
      
      if (hasMatchingProjects) {
        expandedIds.add(program.id)
      }
    })
    return expandedIds
  }
  
  const getAutoExpandedProjects = (): Set<string> => {
    if (searchLower === '') return expandedProjects
    
    const expandedIds = new Set<string>()
    filteredPrograms.forEach((program) => {
      const projectsInProgram = projects.get(program.id) || []
      projectsInProgram.forEach((proj) => {
        const activitiesInProject = activities.get(proj.id) || []
        const hasMatchingActivities = activitiesInProject.some((act) => matchesSearch(act.title) || matchesSearch(act.location || ''))
        if (hasMatchingActivities) {
          expandedIds.add(proj.id)
        }
      })
    })
    return expandedIds
  }
  
  const displayExpandedPrograms = searchLower === '' ? expandedPrograms : getAutoExpandedPrograms()
  const displayExpandedProjects = searchLower === '' ? expandedProjects : getAutoExpandedProjects()

  return (
    <div className="space-y-8" style={{ padding: '2rem' }}>
      {/* Modal Backdrop and Form */}
      {view === 'form' && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto px-4">
          <div className="my-8">
            <ActivityForm
              initialData={editingActivity || undefined}
              onSubmit={handleSubmitActivity}
              onCancel={() => {
                setView('list')
                setEditingActivity(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area - dimmed when form modal is open */}
      <div style={{ opacity: view === 'form' ? 0.5 : 1, pointerEvents: view === 'form' ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
      {/* Quick Action Buttons */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setView('createProgram')}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            + New Program
          </button>
          <button
            onClick={() => setView('createProject')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            + New Project
          </button>
          <button
            onClick={() => setView('createActivity')}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
          >
            + New Activity
          </button>
        </div>
      </div>

      {/* Edit Program Form */}
      {(view as any) === 'editProgram' && editingProgram && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Program</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={editingProgram.title}
                onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Program title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editingProgram.description}
                onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Program description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={editingProgram.startDate}
                  onChange={(e) => setEditingProgram({ ...editingProgram, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={editingProgram.endDate}
                  onChange={(e) => setEditingProgram({ ...editingProgram, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleEditProgram}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setView('list')
                  setEditingProgram(null)
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Program Form */}
      {view === 'createProgram' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Program</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={newProgram.title}
                onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Program title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newProgram.description}
                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Program description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={newProgram.startDate}
                  onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={newProgram.endDate}
                  onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleCreateProgram}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
              >
                Create Program
              </button>
              <button
                onClick={() => {
                  setView('list')
                  setNewProgram({ title: '', description: '', startDate: '', endDate: '' })
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Form */}
      {view === 'editProject' && editingProject && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Project</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Project title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={editingProject.description}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Project description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={editingProject.startDate}
                  onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={editingProject.endDate}
                  onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleEditProject}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditingProject(null)
                  setView('list')
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project - Select Parent Form */}
      {view === 'createProject' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Parent Program for New Project</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Program *</label>
              <select
                value={selectedProgram?.id || ''}
                onChange={(e) => {
                  const program = programs.find((p) => p.id === e.target.value)
                  if (program) {
                    setSelectedProgram(program)
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a Program --</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedProgram && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Project Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Project title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Project description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        value={newProject.endDate}
                        onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleCreateProject}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      Create Project
                    </button>
                    <button
                      onClick={() => {
                        setView('list')
                        setNewProject({ title: '', description: '', startDate: '', endDate: '' })
                        setSelectedProgram(null)
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Activity - Select Parent Form */}
      {view === 'createActivity' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Parent for New Activity</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Program *</label>
              <select
                value={selectedProgram?.id || ''}
                onChange={(e) => {
                  const program = programs.find((p) => p.id === e.target.value)
                  if (program) {
                    setSelectedProgram(program)
                    setSelectedProject(null)
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">-- Select a Program --</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedProgram && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Project *</label>
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const project = programProjects.find((pr) => pr.id === e.target.value)
                    if (project) setSelectedProject(project)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">-- Select a Project --</option>
                  {programProjects.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {selectedProgram && selectedProject && (
                <button
                  onClick={() => {
                    setEditingActivity(null)
                    setView('form')
                  }}
                  className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition"
                >
                  Continue to Activity Form
                </button>
              )}
              <button
                onClick={() => {
                  setView('list')
                  setSelectedProgram(null)
                  setSelectedProject(null)
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hierarchical Tree View */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Programs & Projects</h3>
        
        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search programs, projects, or activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <p className="text-xs text-gray-500 mt-2">
              Found {filteredPrograms.length} program(s) {searchTerm ? 'matching your search' : ''}
            </p>
          )}
        </div>

        {programs.length === 0 ? (
          <p className="text-gray-500">No programs found. Create one to get started.</p>
        ) : filteredPrograms.length === 0 ? (
          <p className="text-gray-500">No results for "{searchTerm}". Try a different search term.</p>
        ) : (
          <div className="space-y-2">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Program Item */}
                <div
                  className={`p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition group ${
                    selectedProgram?.id === program.id ? 'bg-teal-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedProgram(program)
                    setSelectedProject(null)
                    toggleProgram(program.id)
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`transform transition text-gray-400 ${displayExpandedPrograms.has(program.id) ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{program.title}</p>
                      {program.description && <p className="text-sm text-gray-500">{program.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setInfoModal({ type: 'program', data: program })
                      }}
                      className="text-gray-500 hover:text-gray-700 font-semibold text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                      title="View program details"
                    >
                      ?
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingProgram(program)
                        setView('editProgram' as any)
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Edit program"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const projectCount = (projects.get(program.id) || []).length
                        if (!window.confirm(
                          `Delete program "${program.title}"? This will delete ${projectCount} project(s) and all activities underneath.`
                        )) return
                        deleteExtensionProgram(program.id)
                          .then(() => {
                            setPrograms((prev) => prev.filter((p) => p.id !== program.id))
                            projects.delete(program.id)
                            if (selectedProgram?.id === program.id) {
                              setSelectedProgram(null)
                              setSelectedProject(null)
                            }
                            setNotification({ type: 'success', text: 'Program deleted successfully' })
                          })
                          .catch(() => {
                            setNotification({ type: 'error', text: 'Failed to delete program' })
                          })
                      }}
                      className="text-red-500 hover:text-red-700 text-sm w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      title="Delete program"
                    >
                      🗑️
                    </button>
                    <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                      Program
                    </span>
                  </div>
                </div>

                {/* Projects List (shown when program is expanded) */}
                {displayExpandedPrograms.has(program.id) && selectedProgram?.id === program.id && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {programProjects.length === 0 ? (
                      <div className="p-4 pl-12 text-gray-500 text-sm">No projects yet</div>
                    ) : (
                      programProjects.map((project) => (
                        <div key={project.id} className="border-b border-gray-200 last:border-b-0">
                          {/* Project Item */}
                          <div
                            className={`p-4 pl-12 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition group ${
                              selectedProject?.id === project.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              setSelectedProject(project)
                              toggleProject(project.id, program.id)
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className={`transform transition text-gray-400 ${displayExpandedProjects.has(project.id) ? 'rotate-90' : ''}`}>
                                ▶
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{project.title}</p>
                                {project.description && (
                                  <p className="text-sm text-gray-500">{project.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setInfoModal({ type: 'project', data: project })
                                }}
                                className="text-gray-500 hover:text-gray-700 font-semibold text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                                title="View project details"
                              >
                                ?
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingProject(project)
                                  setView('editProject' as any)
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="Edit project"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const activityCount = (activities.get(`${program.id}-${project.id}`) || []).length
                                  if (!window.confirm(
                                    `Delete project "${project.title}"? This will delete ${activityCount} activity(ies) underneath.`
                                  )) return
                                  deleteProject(program.id, project.id)
                                    .then(() => {
                                      setProjects((prev) => {
                                        const newMap = new Map(prev)
                                        const prj = newMap.get(program.id) || []
                                        newMap.set(program.id, prj.filter((p) => p.id !== project.id))
                                        return newMap
                                      })
                                      activities.delete(`${program.id}-${project.id}`)
                                      if (selectedProject?.id === project.id) {
                                        setSelectedProject(null)
                                      }
                                      setNotification({ type: 'success', text: 'Project deleted successfully' })
                                    })
                                    .catch(() => {
                                      setNotification({ type: 'error', text: 'Failed to delete project' })
                                    })
                                }}
                                className="text-red-500 hover:text-red-700 text-sm w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                title="Delete project"
                              >
                                🗑️
                              </button>
                              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                                Project
                              </span>
                            </div>
                          </div>

                          {/* Activities List (shown when project is expanded) */}
                          {displayExpandedProjects.has(project.id) && (
                            <div className="bg-white border-t border-gray-100">
                              {(() => {
                                const key = `${program.id}-${project.id}`
                                const projectActivities = activities.get(key) || []
                                return projectActivities.length === 0 ? (
                                  <div className="p-3 pl-20 text-gray-400 text-sm italic">No activities yet</div>
                                ) : (
                                  projectActivities.map((activity) => (
                                    <div key={activity.id} className="p-3 pl-20 border-b border-gray-100 last:border-b-0 flex items-center justify-between hover:bg-gray-50 group">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
                                        <p className="text-xs text-gray-500">{activity.location}</p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded whitespace-nowrap">
                                          Activity
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setInfoModal({ type: 'activity', data: activity })
                                          }}
                                          className="text-gray-500 hover:text-gray-700 font-semibold text-sm w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
                                          title="View activity details"
                                        >
                                          ?
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingActivity(activity)
                                            setView('form')
                                          }}
                                          className="text-blue-600 hover:text-blue-800 text-sm w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                          title="Edit activity"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={async (e) => {
                                            e.stopPropagation()
                                            if (!window.confirm('Delete this activity?')) return
                                            try {
                                              await deleteActivity(program.id, project.id, activity.id)
                                              const key = `${program.id}-${project.id}`
                                              setActivities((prev) => {
                                                const newMap = new Map(prev)
                                                const acts = newMap.get(key) || []
                                                newMap.set(key, acts.filter((a) => a.id !== activity.id))
                                                return newMap
                                              })
                                              setNotification({ type: 'success', text: 'Activity deleted successfully' })
                                            } catch (error) {
                                              setNotification({ type: 'error', text: 'Failed to delete activity' })
                                            }
                                          }}
                                          className="text-red-600 hover:text-red-800 text-sm w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                          title="Delete activity"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full my-8 flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {infoModal.type === 'program' && 'Program Details'}
                {infoModal.type === 'project' && 'Project Details'}
                {infoModal.type === 'activity' && 'Activity Details'}
              </h2>
              <button
                onClick={() => setInfoModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {infoModal.type === 'program' && (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Title</p>
                    <p className="text-gray-900">{infoModal.data.title}</p>
                  </div>
                  {infoModal.data.description && (
                    <div>
                      <p className="text-gray-500 font-medium">Description</p>
                      <p className="text-gray-900">{infoModal.data.description}</p>
                    </div>
                  )}
                  {infoModal.data.startDate && (
                    <div>
                      <p className="text-gray-500 font-medium">Start Date</p>
                      <p className="text-gray-900">{new Date(infoModal.data.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {infoModal.data.endDate && (
                    <div>
                      <p className="text-gray-500 font-medium">End Date</p>
                      <p className="text-gray-900">{new Date(infoModal.data.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {infoModal.type === 'project' && (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Title</p>
                    <p className="text-gray-900">{infoModal.data.title}</p>
                  </div>
                  {infoModal.data.description && (
                    <div>
                      <p className="text-gray-500 font-medium">Description</p>
                      <p className="text-gray-900">{infoModal.data.description}</p>
                    </div>
                  )}
                  {infoModal.data.startDate && (
                    <div>
                      <p className="text-gray-500 font-medium">Start Date</p>
                      <p className="text-gray-900">{new Date(infoModal.data.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {infoModal.data.endDate && (
                    <div>
                      <p className="text-gray-500 font-medium">End Date</p>
                      <p className="text-gray-900">{new Date(infoModal.data.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {infoModal.type === 'activity' && (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Basic Information</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500 font-medium">Title</p>
                          <p className="text-gray-900">{infoModal.data.title}</p>
                        </div>
                        {infoModal.data.location && (
                          <div>
                            <p className="text-gray-500 font-medium">Location</p>
                            <p className="text-gray-900">{infoModal.data.location}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {infoModal.data.startDate && (
                            <div>
                              <p className="text-gray-500 font-medium">Start Date</p>
                              <p className="text-gray-900">{new Date(infoModal.data.startDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {infoModal.data.endDate && (
                            <div>
                              <p className="text-gray-500 font-medium">End Date</p>
                              <p className="text-gray-900">{new Date(infoModal.data.endDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        {infoModal.data.duration && (
                          <div>
                            <p className="text-gray-500 font-medium">Duration</p>
                            <p className="text-gray-900">{infoModal.data.duration}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Organization & Implementation */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Organization & Implementation</h3>
                      <div className="space-y-3 text-sm">
                        {infoModal.data.extensionAgenda && (
                          <div>
                            <p className="text-gray-500 font-medium">Extension Agenda</p>
                            <p className="text-gray-900">{infoModal.data.extensionAgenda}</p>
                          </div>
                        )}
                        {infoModal.data.implementingCollege && (
                          <div>
                            <p className="text-gray-500 font-medium">Implementing College</p>
                            <p className="text-gray-900">{infoModal.data.implementingCollege}</p>
                          </div>
                        )}
                        {infoModal.data.programsInvolved && infoModal.data.programsInvolved.length > 0 && (
                          <div>
                            <p className="text-gray-500 font-medium">Programs Involved</p>
                            <p className="text-gray-900">{infoModal.data.programsInvolved.join(', ')}</p>
                          </div>
                        )}
                        {infoModal.data.facultyExtensionists && infoModal.data.facultyExtensionists.length > 0 && (
                          <div>
                            <p className="text-gray-500 font-medium">Faculty Extensionists</p>
                            <p className="text-gray-900">{infoModal.data.facultyExtensionists.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Partnership & Support */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Partnership & Support</h3>
                      <div className="space-y-3 text-sm">
                        {infoModal.data.partnerAgency && (
                          <div>
                            <p className="text-gray-500 font-medium">Partner Agency</p>
                            <p className="text-gray-900">{infoModal.data.partnerAgency}</p>
                          </div>
                        )}
                        {infoModal.data.typeOfPartner && (
                          <div>
                            <p className="text-gray-500 font-medium">Type of Partner</p>
                            <p className="text-gray-900">{infoModal.data.typeOfPartner}</p>
                          </div>
                        )}
                        {infoModal.data.supportProvided && (
                          <div>
                            <p className="text-gray-500 font-medium">Support Provided</p>
                            <p className="text-gray-900">{infoModal.data.supportProvided}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">Financial</h3>
                      <div className="space-y-3 text-sm">
                        {infoModal.data.sourceOfFund && (
                          <div>
                            <p className="text-gray-500 font-medium">Source of Fund</p>
                            <p className="text-gray-900">{infoModal.data.sourceOfFund}</p>
                          </div>
                        )}
                        {infoModal.data.totalCost >= 0 && (
                          <div>
                            <p className="text-gray-500 font-medium">Total Cost</p>
                            <p className="text-gray-900">${infoModal.data.totalCost.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SDG & Participants */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">SDGs & Participants</h3>
                      <div className="space-y-3 text-sm">
                        {infoModal.data.sdgInvolved && infoModal.data.sdgInvolved.length > 0 && (
                          <div>
                            <p className="text-gray-500 font-medium">SDGs Involved</p>
                            <p className="text-gray-900">{infoModal.data.sdgInvolved.map((id: string) => {
                              const sdg = SDG_LIST.find((s) => s.id === id)
                              return sdg ? sdg.name : id
                            }).join(', ')}</p>
                          </div>
                        )}
                        {infoModal.data.typeOfParticipant && infoModal.data.typeOfParticipant.length > 0 && (
                          <div>
                            <p className="text-gray-500 font-medium">Type of Participants</p>
                            <p className="text-gray-900">{infoModal.data.typeOfParticipant.join(', ')}</p>
                          </div>
                        )}
                        {infoModal.data.beneficiaries?.total > 0 && (
                          <div>
                            <p className="text-gray-500 font-medium">Beneficiaries</p>
                            <p className="text-gray-900">
                              Total: <span className="font-semibold">{infoModal.data.beneficiaries.total}</span>
                              <br />
                              <span className="text-xs text-gray-600">Male: {infoModal.data.beneficiaries.male} | Female: {infoModal.data.beneficiaries.female}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setInfoModal(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End of Main Content Area */}
    </div>
  )
}
