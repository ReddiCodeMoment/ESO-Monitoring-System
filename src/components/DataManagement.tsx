import { useState, useEffect } from 'react'
import { ExtensionProgram, Project, Activity } from '../types'
import { 
  getExtensionPrograms, 
  createActivity, 
  updateActivity, 
  createProject, 
  getProjectsByProgramId,
  createExtensionProgram
} from '../services/extensionService'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ActivityForm } from './ActivityForm'
import { ActivityList } from './ActivityList'

export function DataManagement() {
  const { setNotification } = useApp()
  const { user } = useAuth()
  
  // Data states
  const [programs, setPrograms] = useState<ExtensionProgram[]>([])
  const [projects, setProjects] = useState<Map<string, Project[]>>(new Map())
  
  // Selection states
  const [selectedProgram, setSelectedProgram] = useState<ExtensionProgram | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  // UI states
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set())
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'list' | 'form' | 'createProgram' | 'createProject' | 'createActivity'>('list')
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  
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

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
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
  if (view === 'form' && selectedProject) {
    return (
      <ActivityForm
        initialData={editingActivity || undefined}
        onSubmit={handleSubmitActivity}
        onCancel={() => {
          setView('list')
          setEditingActivity(null)
        }}
      />
    )
  }

  const programProjects = selectedProgram ? projects.get(selectedProgram.id) || [] : []

  return (
    <div className="space-y-6" style={{ padding: '2rem' }}>
      {/* Quick Action Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
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
        {programs.length === 0 ? (
          <p className="text-gray-500">No programs found. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {programs.map((program) => (
              <div key={program.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Program Item */}
                <div
                  className={`p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition ${
                    selectedProgram?.id === program.id ? 'bg-teal-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedProgram(program)
                    setSelectedProject(null)
                    toggleProgram(program.id)
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`transform transition text-gray-400 ${expandedPrograms.has(program.id) ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{program.title}</p>
                      {program.description && <p className="text-sm text-gray-500">{program.description}</p>}
                    </div>
                  </div>
                  <span className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                    Program
                  </span>
                </div>

                {/* Projects List (shown when program is expanded) */}
                {expandedPrograms.has(program.id) && selectedProgram?.id === program.id && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    {programProjects.length === 0 ? (
                      <div className="p-4 pl-12 text-gray-500 text-sm">No projects yet</div>
                    ) : (
                      programProjects.map((project) => (
                        <div key={project.id} className="border-b border-gray-200 last:border-b-0">
                          {/* Project Item */}
                          <div
                            className={`p-4 pl-12 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition ${
                              selectedProject?.id === project.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              setSelectedProject(project)
                              toggleProject(project.id)
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className={`transform transition text-gray-400 ${expandedProjects.has(project.id) ? 'rotate-90' : ''}`}>
                                ▶
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{project.title}</p>
                                {project.description && (
                                  <p className="text-sm text-gray-500">{project.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap ml-4">
                              Project
                            </span>
                          </div>
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

      {/* Activities List */}
      {selectedProgram && selectedProject && view === 'list' && (
        <ActivityList
          programId={selectedProgram.id}
          projectId={selectedProject.id}
          onEdit={(activity: Activity) => {
            setEditingActivity(activity)
            setView('form')
          }}
        />
      )}
    </div>
  )
}
