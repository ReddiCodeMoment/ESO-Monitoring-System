import { useState, useEffect } from 'react'
import { ExtensionProgram, Project, Activity, SDG_LIST, IMPLEMENTING_COLLEGES, EXTENSION_AGENDAS, TYPE_OF_COMMUNITY_SERVICE, PROGRAM_STATUS } from '../types'
import { 
  getExtensionPrograms, 
  createActivity, 
  updateActivity, 
  createProject, 
  getProjectsByProgramId,
  createExtensionProgram,
  getActivitiesByProjectId,
  updateExtensionProgram,
  updateProject
} from '../services/extensionService'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../context/NotificationContext'
import { ActivityForm } from './ActivityForm'
import { CreateModal } from './CreateModal'

export function DataManagement() {
  const { userEmail } = useAuth()
  const { showError, showSuccess } = useNotification()
  
  // Data states
  const [programs, setPrograms] = useState<ExtensionProgram[]>([])
  const [projects, setProjects] = useState<Map<string, Project[]>>(new Map())
  const [activities, setActivities] = useState<Map<string, Activity[]>>(new Map())
  
  // Selection states
  const [selectedProgram, setSelectedProgram] = useState<ExtensionProgram | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  // UI states
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [view, setView] = useState<'list' | 'form' | 'createProgram' | 'createProject' | 'createActivity' | 'editProgram' | 'editProject'>('list')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [editingProgram, setEditingProgram] = useState<ExtensionProgram | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [infoModal, setInfoModal] = useState<{ type: 'program' | 'project' | 'activity', data: any } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [filterCollege, setFilterCollege] = useState('')
  const [filterYear, setFilterYear] = useState('')
  
  // Form states
  const [newProgram, setNewProgram] = useState({ title: '', description: '', startDate: '', endDate: '', color: '#3B82F6', implementingCollege: '', extensionAgenda: '', typeOfCommunityService: '' })
  const [newProject, setNewProject] = useState({ title: '', description: '', startDate: '', endDate: '', extensionAgenda: '', typeOfCommunityService: '' })

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const data = await getExtensionPrograms()
      setPrograms(data)
    } catch (error) {
      showError('Loading failed', 'Could not load programs')
      console.error('Error:', error)
    }
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
      showError('Missing information', 'Program title is required')
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      const createData: any = {
        title: newProgram.title,
        description: newProgram.description || '',
        startDate: newProgram.startDate || today,
        endDate: newProgram.endDate || today,
        color: newProgram.color || '#3B82F6',
        createdBy: userEmail || 'unknown',
        archived: false,
      }
      
      // Add implementing college only if it's set
      if (newProgram.implementingCollege) {
        createData.implementingCollege = newProgram.implementingCollege
      }
      
      // Add extension agenda if it's set
      if (newProgram.extensionAgenda) {
        createData.extensionAgenda = newProgram.extensionAgenda
      }
      
      // Add type of community service if it's set
      if (newProgram.typeOfCommunityService) {
        createData.typeOfCommunityService = newProgram.typeOfCommunityService
      }
      
      await createExtensionProgram(createData)
      showSuccess('Program created', `"${newProgram.title}" has been added`)
      setNewProgram({ title: '', description: '', startDate: '', endDate: '', color: '#3B82F6', implementingCollege: '', extensionAgenda: '', typeOfCommunityService: '' })
      setView('list')
      loadPrograms()
    } catch (error) {
      showError('Creation failed', 'Could not create program')
      console.error('Error:', error)
    }
  }

  const handleCreateProject = async () => {
    if (!selectedProgram || !newProject.title.trim()) {
      showError('Missing information', 'Program and project name are required')
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      await createProject(selectedProgram.id, {
        title: newProject.title,
        description: newProject.description,
        startDate: newProject.startDate || today,
        endDate: newProject.endDate || today,
        extensionAgenda: newProject.extensionAgenda,
        typeOfCommunityService: newProject.typeOfCommunityService,
        createdBy: userEmail || 'unknown',
      })
      showSuccess('Project created', `"${newProject.title}" has been added`)
      setNewProject({ title: '', description: '', startDate: '', endDate: '', extensionAgenda: '', typeOfCommunityService: '' })
      setView('list')
      // Reload projects for this program
      projects.delete(selectedProgram.id)
      loadProjectsForProgram(selectedProgram.id)
    } catch (error) {
      showError('Creation failed', 'Could not create project')
      console.error('Error:', error)
    }
  }

  const handleEditProgram = async () => {
    if (!editingProgram || !editingProgram.title.trim()) {
      showError('Missing information', 'Program title is required')
      return
    }

    try {
      // Build update object, only including fields with values
      const updateData: any = {
        title: editingProgram.title,
        description: editingProgram.description || '',
        startDate: editingProgram.startDate,
        endDate: editingProgram.endDate,
      }
      
      // Only include optional fields if they have values
      if (editingProgram.color) {
        updateData.color = editingProgram.color
      }
      if (editingProgram.implementingCollege) {
        updateData.implementingCollege = editingProgram.implementingCollege
      }
      if (editingProgram.extensionAgenda) {
        updateData.extensionAgenda = editingProgram.extensionAgenda
      }
      if (editingProgram.typeOfCommunityService) {
        updateData.typeOfCommunityService = editingProgram.typeOfCommunityService
      }
      if (editingProgram.budgetUtilization && editingProgram.budgetUtilization > 0) {
        updateData.budgetUtilization = editingProgram.budgetUtilization
      }
      if (editingProgram.sourceOfFund) {
        updateData.sourceOfFund = editingProgram.sourceOfFund
      }
      if (editingProgram.status) {
        updateData.status = editingProgram.status
      }
      
      await updateExtensionProgram(editingProgram.id, updateData)
      showSuccess('Program updated', `"${editingProgram.title}" has been saved`)
      setEditingProgram(null)
      setView('list')
      loadPrograms()
    } catch (error) {
      showError('Update failed', 'Could not update program')
      console.error('Error:', error)
    }
  }

  const handleEditProject = async () => {
    if (!selectedProgram || !editingProject || !editingProject.title.trim()) {
      showError('Missing information', 'Project name is required')
      return
    }

    try {
      await updateProject(selectedProgram.id, editingProject.id, {
        title: editingProject.title,
        description: editingProject.description,
        startDate: editingProject.startDate,
        endDate: editingProject.endDate,
      })
      showSuccess('Project updated', `"${editingProject.title}" has been saved`)
      setEditingProject(null)
      setView('list')
      // Reload projects for this program
      projects.delete(selectedProgram.id)
      loadProjectsForProgram(selectedProgram.id)
    } catch (error) {
      showError('Update failed', 'Could not update project')
      console.error('Error:', error)
    }
  }

  const handleSubmitActivity = async (formData: any) => {
    if (!selectedProgram || !selectedProject) return

    try {
      // Auto-fill implementing college from program
      const activityData = {
        ...formData,
        implementingCollege: selectedProgram.implementingCollege || '',
      }

      if (editingActivity) {
        await updateActivity(selectedProgram.id, selectedProject.id, editingActivity.id, {
          title: activityData.title,
          location: activityData.location,
          startDate: activityData.startDate,
          endDate: activityData.endDate,
          extensionAgenda: activityData.extensionAgenda,
          typeOfCommunityService: activityData.typeOfCommunityService,
          duration: activityData.duration,
          sdgInvolved: activityData.sdgInvolved,
          implementingCollege: activityData.implementingCollege,
          programsInvolved: activityData.programsInvolved,
          facultyExtensionists: activityData.facultyExtensionists,
          partnerAgency: activityData.partnerAgency,
          typeOfPartner: activityData.typeOfPartner,
          supportProvided: activityData.supportProvided,
          totalCost: parseInt(activityData.totalCost),
          sourceOfFund: activityData.sourceOfFund,
          typeOfParticipant: activityData.typeOfParticipant,
          beneficiaries: {
            male: parseInt(activityData.beneficiaries.male),
            female: parseInt(activityData.beneficiaries.female),
            total: parseInt(activityData.beneficiaries.total),
          },
        })
        showSuccess('Activity updated', 'Changes have been saved')
      } else {
        await createActivity(selectedProgram.id, selectedProject.id, {
          title: activityData.title,
          location: activityData.location,
          startDate: activityData.startDate,
          endDate: activityData.endDate,
          extensionAgenda: activityData.extensionAgenda,
          typeOfCommunityService: activityData.typeOfCommunityService,
          duration: activityData.duration,
          sdgInvolved: activityData.sdgInvolved,
          implementingCollege: activityData.implementingCollege,
          programsInvolved: activityData.programsInvolved,
          facultyExtensionists: activityData.facultyExtensionists,
          partnerAgency: activityData.partnerAgency,
          typeOfPartner: activityData.typeOfPartner,
          supportProvided: activityData.supportProvided,
          totalCost: parseInt(activityData.totalCost),
          sourceOfFund: activityData.sourceOfFund,
          typeOfParticipant: activityData.typeOfParticipant,
          beneficiaries: {
            male: parseInt(activityData.beneficiaries.male),
            female: parseInt(activityData.beneficiaries.female),
            total: parseInt(activityData.beneficiaries.total),
          },
          createdBy: userEmail || 'unknown',
          status: 'draft',
        })
        showSuccess('Activity created', `"${activityData.title}" has been added`)
      }

      setView('list')
      setEditingActivity(null)
      // Reload projects
      if (selectedProgram) {
        projects.delete(selectedProgram.id)
        loadProjectsForProgram(selectedProgram.id)
      }
    } catch (error) {
      showError('Save failed', 'Could not save activity')
      console.error('Error:', error)
    }
  }

  // CreateModal handlers
  const handleCreateProgramFromModal = async (data: any) => {
    try {
      const createData: any = {
        title: data.title,
        description: data.description || '',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || new Date().toISOString().split('T')[0],
        color: data.color || '#3B82F6',
        createdBy: userEmail || 'unknown',
        archived: false,
      }
      
      // Add optional fields only if they have values
      if (data.implementingCollege && data.implementingCollege.trim()) {
        createData.implementingCollege = data.implementingCollege
      }
      if (data.extensionAgenda && data.extensionAgenda.trim()) {
        createData.extensionAgenda = data.extensionAgenda
      }
      if (data.typeOfCommunityService && data.typeOfCommunityService.trim()) {
        createData.typeOfCommunityService = data.typeOfCommunityService
      }
      if (data.budgetUtilization && data.budgetUtilization > 0) {
        createData.budgetUtilization = data.budgetUtilization
      }
      if (data.sourceOfFund && data.sourceOfFund.trim()) {
        createData.sourceOfFund = data.sourceOfFund
      }
      if (data.status && data.status.trim()) {
        createData.status = data.status
      }
      if (data.sdgInvolved && data.sdgInvolved.length > 0) {
        createData.sdgInvolved = data.sdgInvolved
      }
      if (data.typeOfBeneficiaries && data.typeOfBeneficiaries.trim()) {
        createData.typeOfBeneficiaries = data.typeOfBeneficiaries
      }
      if (data.beneficiaries) {
        createData.beneficiaries = data.beneficiaries
      }
      
      await createExtensionProgram(createData)
      showSuccess('Program created', `"${data.title}" has been added`)
      setIsCreateModalOpen(false)
      loadPrograms()
    } catch (error) {
      showError('Creation failed', 'Could not create program')
      console.error('Error:', error)
    }
  }

  const handleCreateProjectFromModal = async (data: any) => {
    if (!data.parentProgramId) {
      showError('Missing information', 'Please select a program')
      return
    }

    const parentProgram = programs.find((p) => p.id === data.parentProgramId)
    if (!parentProgram) {
      showError('Invalid selection', 'Selected program not found')
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      await createProject(parentProgram.id, {
        title: data.title,
        description: data.description || '',
        startDate: data.startDate || today,
        endDate: data.endDate || today,
        extensionAgenda: data.extensionAgenda || '',
        typeOfCommunityService: data.typeOfCommunityService || '',
        createdBy: userEmail || 'unknown',
      })
      showSuccess('Project created', `"${data.title}" has been added`)
      setIsCreateModalOpen(false)
      // Reload projects for this program
      projects.delete(parentProgram.id)
      loadProjectsForProgram(parentProgram.id)
    } catch (error) {
      showError('Creation failed', 'Could not create project')
      console.error('Error:', error)
    }
  }

  const handleCreateActivityFromModal = async (data: any) => {
    if (!data.parentProgramId || !data.parentProjectId) {
      showError('Missing information', 'Please select both a program and project')
      return
    }

    const parentProgram = programs.find((p) => p.id === data.parentProgramId)
    const parentProject = (projects.get(data.parentProgramId) || []).find((p) => p.id === data.parentProjectId)

    if (!parentProgram || !parentProject) {
      showError('Invalid selection', 'Selected program or project not found')
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      await createActivity(parentProgram.id, parentProject.id, {
        title: data.title || '',
        location: data.location || '',
        startDate: data.startDate || today,
        endDate: data.endDate || today,
        extensionAgenda: data.extensionAgenda || '',
        typeOfCommunityService: data.typeOfCommunityService || '',
        duration: 'Not specified',
        sdgInvolved: [],
        implementingCollege: parentProgram.implementingCollege || '',
        programsInvolved: [],
        facultyExtensionists: [],
        partnerAgency: '',
        typeOfPartner: '',
        supportProvided: '',
        totalCost: 0,
        sourceOfFund: '',
        typeOfParticipant: [],
        beneficiaries: { male: 0, female: 0, total: 0 },
        createdBy: userEmail || 'unknown',
        status: 'draft',
      })
      showSuccess('Activity created', `"${data.title}" has been added`)
      setIsCreateModalOpen(false)
      // Reload projects
      if (parentProgram) {
        projects.delete(parentProgram.id)
        loadProjectsForProgram(parentProgram.id)
      }
    } catch (error) {
      showError('Creation failed', 'Could not create activity')
      console.error('Error:', error)
    }
  }

  // Return TSX
  const programProjects = selectedProgram ? projects.get(selectedProgram.id) || [] : []

  // Search/Filter logic
  const searchLower = searchTerm.toLowerCase().trim()
  const matchesSearch = (text: string): boolean => text.toLowerCase().includes(searchLower)
  
  const isWithinDateRange = (startDate: string, endDate: string): boolean => {
    if (!filterStartDate && !filterEndDate) return true
    
    const itemStart = new Date(startDate)
    const itemEnd = new Date(endDate)
    const filterStart = filterStartDate ? new Date(filterStartDate) : new Date('1900-01-01')
    const filterEnd = filterEndDate ? new Date(filterEndDate) : new Date('2099-12-31')
    
    // Check if date range overlaps
    return itemStart <= filterEnd && itemEnd >= filterStart
  }
  
  const isWithinYear = (startDate: string, endDate: string): boolean => {
    if (!filterYear) return true
    
    const year = parseInt(filterYear)
    const itemStart = new Date(startDate)
    const itemEnd = new Date(endDate)
    const yearStart = new Date(`${year}-01-01`)
    const yearEnd = new Date(`${year}-12-31`)
    
    // Check if date range overlaps with the selected year
    return itemStart <= yearEnd && itemEnd >= yearStart
  }
  
  const hasMatchingCollege = (college: string): boolean => {
    if (!filterCollege) return true
    return college === filterCollege
  }
  
  // Get all available years from programs
  const getAvailableYears = (): string[] => {
    const yearsSet = new Set<string>()
    programs.forEach((program) => {
      yearsSet.add(new Date(program.startDate).getFullYear().toString())
      yearsSet.add(new Date(program.endDate).getFullYear().toString())
      
      const projectsInProgram = projects.get(program.id) || []
      projectsInProgram.forEach((proj) => {
        yearsSet.add(new Date(proj.startDate).getFullYear().toString())
        yearsSet.add(new Date(proj.endDate).getFullYear().toString())
        
        const activitiesInProject = activities.get(proj.id) || []
        activitiesInProject.forEach((act) => {
          yearsSet.add(new Date(act.startDate).getFullYear().toString())
          yearsSet.add(new Date(act.endDate).getFullYear().toString())
        })
      })
    })
    return Array.from(yearsSet).sort().reverse()
  }
  
  const filteredPrograms = programs.filter((program) => {
    // Check search match for program/project names
    const programMatches = searchLower === '' || matchesSearch(program.title) || matchesSearch(program.description || '')
    
    // Check if program is within date range and year
    const programDateMatch = isWithinDateRange(program.startDate, program.endDate) && isWithinYear(program.startDate, program.endDate)
    
    // Check program college filter
    const programCollegeMatch = hasMatchingCollege(program.implementingCollege || '')
    
    if (programMatches && programDateMatch && programCollegeMatch) return true
    
    // Check projects and activities
    const projectsInProgram = projects.get(program.id) || []
    const projectMatches = projectsInProgram.some((proj) => {
      const projSearch = searchLower === '' || matchesSearch(proj.title) || matchesSearch(proj.description || '')
      const projDate = isWithinDateRange(proj.startDate, proj.endDate) && isWithinYear(proj.startDate, proj.endDate)
      // Projects inherit college from program
      const projCollege = hasMatchingCollege(program.implementingCollege || '')
      
      if (projSearch && projDate && projCollege) return true
      
      // Check activities
      const activitiesInProject = activities.get(proj.id) || []
      return activitiesInProject.some((act) => {
        const actSearch = searchLower === '' || matchesSearch(act.title) || matchesSearch(act.location || '')
        const actDate = isWithinDateRange(act.startDate, act.endDate) && isWithinYear(act.startDate, act.endDate)
        const actCollege = hasMatchingCollege(act.implementingCollege || '')
        
        return actSearch && actDate && actCollege
      })
    })
    
    return projectMatches
  })
  
  const getAutoExpandedProjects = (): Set<string> => {
    const hasFilters = searchLower !== '' || filterStartDate || filterEndDate || filterCollege || filterYear
    if (!hasFilters) return expandedProjects
    
    const expandedIds = new Set<string>()
    filteredPrograms.forEach((program) => {
      const projectsInProgram = projects.get(program.id) || []
      projectsInProgram.forEach((proj) => {
        const activitiesInProject = activities.get(proj.id) || []
        const hasMatchingActivities = activitiesInProject.some((act) => {
          const actSearch = searchLower === '' || matchesSearch(act.title) || matchesSearch(act.location || '')
          const actDate = isWithinDateRange(act.startDate, act.endDate) && isWithinYear(act.startDate, act.endDate)
          const actCollege = hasMatchingCollege(act.implementingCollege || '')
          
          return actSearch && actDate && actCollege
        })
        if (hasMatchingActivities) {
          expandedIds.add(proj.id)
        }
      })
    })
    return expandedIds
  }
  
  const hasFilters = searchLower !== '' || filterStartDate || filterEndDate || filterCollege || filterYear
  const displayExpandedProjects = hasFilters ? getAutoExpandedProjects() : expandedProjects

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
      <div className="space-y-8" style={{ opacity: view === 'form' ? 0.5 : 1, pointerEvents: view === 'form' ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
      {/* Create Button */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 transition font-semibold"
        >
          + Create
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Filters</h4>
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Date Range Start</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Date Range End</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Implementing College</label>
              <select
                value={filterCollege}
                onChange={(e) => setFilterCollege(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- All Colleges --</option>
                {IMPLEMENTING_COLLEGES.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- All Years --</option>
                {getAvailableYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            {(filterStartDate || filterEndDate || filterCollege || filterYear) && (
              <button
                onClick={() => {
                  setFilterStartDate('')
                  setFilterEndDate('')
                  setFilterCollege('')
                  setFilterYear('')
                }}
                className="px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition text-sm font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
          {(filterStartDate || filterEndDate || filterCollege || filterYear) && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-3">
              ✓ Showing {filteredPrograms.length} program(s) matching your filters
            </p>
          )}
        </div>
      </div>

      {/* Edit Program Modal */}
      {(view as any) === 'editProgram' && editingProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full my-8 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Program</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
              <input
                type="text"
                value={editingProgram.title}
                onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Program title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                value={editingProgram.description}
                onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Program description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  value={editingProgram.startDate}
                  onChange={(e) => setEditingProgram({ ...editingProgram, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  value={editingProgram.endDate}
                  onChange={(e) => setEditingProgram({ ...editingProgram, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Program Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={editingProgram.color || '#3B82F6'}
                  onChange={(e) => setEditingProgram({ ...editingProgram, color: e.target.value })}
                  className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">Select a color for this program</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Implementing College</label>
              <select
                value={editingProgram.implementingCollege || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, implementingCollege: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select College --</option>
                {IMPLEMENTING_COLLEGES.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Extension Agenda</label>
              <select
                value={editingProgram.extensionAgenda || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, extensionAgenda: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select Agenda --</option>
                {EXTENSION_AGENDAS.map((agenda) => (
                  <option key={agenda} value={agenda}>
                    {agenda}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type of Community Service</label>
              <select
                value={editingProgram.typeOfCommunityService || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, typeOfCommunityService: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select Type --</option>
                {TYPE_OF_COMMUNITY_SERVICE.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget Utilization (PHP)</label>
              <input
                type="number"
                value={editingProgram.budgetUtilization || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, budgetUtilization: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source of Fund</label>
              <input
                type="text"
                value={editingProgram.sourceOfFund || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, sourceOfFund: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g., Government, Private, NGO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={editingProgram.status || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, status: e.target.value as 'On Going' | 'Completed' | undefined })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select Status --</option>
                {PROGRAM_STATUS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
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
                  className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Program Form */}
      {view === 'createProgram' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Create New Program</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
              <input
                type="text"
                value={newProgram.title}
                  onChange={(e) => setNewProgram({ ...newProgram, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Program title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                value={newProgram.description}
                onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Program description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  value={newProgram.startDate}
                  onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  value={newProgram.endDate}
                  onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Program Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={newProgram.color || '#3B82F6'}
                  onChange={(e) => setNewProgram({ ...newProgram, color: e.target.value })}
                  className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">Select a color for this program</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Implementing College</label>
              <select
                value={newProgram.implementingCollege || ''}
                onChange={(e) => setNewProgram({ ...newProgram, implementingCollege: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select College --</option>
                {IMPLEMENTING_COLLEGES.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Extension Agenda</label>
              <select
                value={newProgram.extensionAgenda || ''}
                onChange={(e) => setNewProgram({ ...newProgram, extensionAgenda: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select Agenda --</option>
                {EXTENSION_AGENDAS.map((agenda) => (
                  <option key={agenda} value={agenda}>
                    {agenda}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type of Community Service</label>
              <select
                value={newProgram.typeOfCommunityService || ''}
                onChange={(e) => setNewProgram({ ...newProgram, typeOfCommunityService: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select Type --</option>
                {TYPE_OF_COMMUNITY_SERVICE.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
                  setNewProgram({ title: '', description: '', startDate: '', endDate: '', color: '#3B82F6', implementingCollege: '', extensionAgenda: '', typeOfCommunityService: '' })
                }}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {view === 'editProject' && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full my-8 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Project</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
              <input
                type="text"
                value={editingProject.title}
                onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Project title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                value={editingProject.description}
                onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
                placeholder="Project description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  value={editingProject.startDate}
                  onChange={(e) => setEditingProject({ ...editingProject, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  value={editingProject.endDate}
                  onChange={(e) => setEditingProject({ ...editingProject, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Extension Agenda</label>
              <select
                value={editingProject.extensionAgenda || ''}
                onChange={(e) => setEditingProject({ ...editingProject, extensionAgenda: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select Agenda --</option>
                {EXTENSION_AGENDAS.map((agenda) => (
                  <option key={agenda} value={agenda}>
                    {agenda}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type of Community Service</label>
              <select
                value={editingProject.typeOfCommunityService || ''}
                onChange={(e) => setEditingProject({ ...editingProject, typeOfCommunityService: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">-- Select Type --</option>
                {TYPE_OF_COMMUNITY_SERVICE.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project - Select Parent Form */}
      {view === 'createProject' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6\">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4\">Select Parent Program for New Project</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300\">Program *</label>
              <select
                value={selectedProgram?.id || ''}
                onChange={(e) => {
                  const program = programs.find((p) => p.id === e.target.value)
                  if (program) {
                    setSelectedProgram(program)
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100\"
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
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4\">Project Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300\">Title *</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100\"
                      placeholder="Project title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300\">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100\"
                      rows={3}
                      placeholder="Project description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300\">Start Date</label>
                      <input
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100\"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300\">End Date</label>
                      <input
                        type="date"
                        value={newProject.endDate}
                        onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100\"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300\">Extension Agenda</label>
                    <select
                      value={newProject.extensionAgenda || ''}
                      onChange={(e) => setNewProject({ ...newProject, extensionAgenda: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100\"
                    >
                      <option value="">-- Select Agenda --</option>
                      {EXTENSION_AGENDAS.map((agenda) => (
                        <option key={agenda} value={agenda}>
                          {agenda}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300\">Type of Community Service</label>
                    <select
                      value={newProject.typeOfCommunityService || ''}
                      onChange={(e) => setNewProject({ ...newProject, typeOfCommunityService: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100\"
                    >
                      <option value="">-- Select Type --</option>
                      {TYPE_OF_COMMUNITY_SERVICE.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
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
                        setNewProject({ title: '', description: '', startDate: '', endDate: '', extensionAgenda: '', typeOfCommunityService: '' })
                        setSelectedProgram(null)
                      }}
                      className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Select Parent for New Activity</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Program *</label>
              <select
                value={selectedProgram?.id || ''}
                onChange={(e) => {
                  const program = programs.find((p) => p.id === e.target.value)
                  if (program) {
                    setSelectedProgram(program)
                    setSelectedProject(null)
                  }
                }}
                className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project *</label>
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const project = programProjects.find((pr) => pr.id === e.target.value)
                    if (project) setSelectedProject(project)
                  }}
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Split Panel Layout */}
      <div className="flex gap-6 mt-6 h-[calc(100vh-200px)]">
        
        {/* LEFT PANEL: Programs List */}
        <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col overflow-hidden">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Programs</h3>
            
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            />
            {searchTerm && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Found {filteredPrograms.length} program(s)
              </p>
            )}
          </div>

          {/* Programs List - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {programs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No programs yet</p>
            ) : filteredPrograms.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No matching programs</p>
            ) : (
              <div className="space-y-2">
                {filteredPrograms.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => {
                      setSelectedProgram(program)
                      setSelectedProject(null)
                      loadProjectsForProgram(program.id)
                    }}
                    className={`p-4 rounded-lg cursor-pointer transition border-l-4 ${
                      selectedProgram?.id === program.id
                        ? 'bg-teal-50 dark:bg-gray-700 border-l-teal-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-l-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    style={{
                      borderLeftColor: selectedProgram?.id === program.id ? (program.color || '#14b8a6') : '#d1d5db'
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">{program.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(program.startDate).getFullYear()} - {new Date(program.endDate).getFullYear()}
                        </p>
                      </div>
                      {program.status && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                          program.status === 'Completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {program.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Details & Projects */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col overflow-hidden">
          {selectedProgram ? (
            <>
              {/* Program Details Header */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedProgram.title}</h2>
                    {selectedProgram.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{selectedProgram.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProgram(selectedProgram)
                        setView('editProgram')
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition"
                      title="Edit program"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setInfoModal({ type: 'program', data: selectedProgram })}
                      className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition"
                      title="View details"
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>📅 {new Date(selectedProgram.startDate).toLocaleDateString()} - {new Date(selectedProgram.endDate).toLocaleDateString()}</div>
                  {selectedProgram.implementingCollege && <div>🏫 {selectedProgram.implementingCollege}</div>}
                  {selectedProgram.status && (
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedProgram.status === 'Completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {selectedProgram.status}
                      </span>
                    </div>
                  )}
                  {selectedProgram.budgetUtilization && selectedProgram.budgetUtilization > 0 && (
                    <div>💰 ₱{selectedProgram.budgetUtilization.toLocaleString('en-PH')}</div>
                  )}
                </div>
              </div>

              {/* Projects & Activities - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projects ({(projects.get(selectedProgram.id) || []).length})</h3>
                    <button
                      onClick={() => {
                        setIsCreateModalOpen(true)
                      }}
                      className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded transition"
                    >
                      + Add Project
                    </button>
                  </div>

                  {(projects.get(selectedProgram.id) || []).length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No projects yet</p>
                  ) : (
                    <div className="space-y-3">
                      {(projects.get(selectedProgram.id) || []).map((project) => (
                        <div
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project)
                            toggleProject(project.id, selectedProgram.id)
                          }}
                          className={`p-4 rounded-lg cursor-pointer transition border ${
                            selectedProject?.id === project.id
                              ? 'bg-blue-50 dark:bg-gray-700 border-blue-300 dark:border-blue-500'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{project.title}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setInfoModal({ type: 'project', data: project })
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              ℹ️
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{project.description || 'No description'}</p>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </div>

                          {/* Activities for this project */}
                          {displayExpandedProjects.has(project.id) && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Activities ({(activities.get(`${selectedProgram.id}-${project.id}`) || []).length})
                              </p>
                              {(activities.get(`${selectedProgram.id}-${project.id}`) || []).length === 0 ? (
                                <p className="text-xs text-gray-500 dark:text-gray-400">No activities</p>
                              ) : (
                                <div className="space-y-2">
                                  {(activities.get(`${selectedProgram.id}-${project.id}`) || []).map((activity) => (
                                    <div key={activity.id} className="bg-white dark:bg-gray-800 p-2 rounded text-xs border border-gray-200 dark:border-gray-600">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{activity.title}</span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setInfoModal({ type: 'activity', data: activity })
                                          }}
                                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        >
                                          ℹ️
                                        </button>
                                      </div>
                                      <p className="text-gray-500 dark:text-gray-400 mt-1">{activity.location}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select a program to view details</p>
            </div>
          )}
        </div>
      </div>


      </div>

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full my-8 flex flex-col max-h-[80vh]">
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
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Title</p>
                    <p className="text-gray-900 dark:text-gray-100">{infoModal.data.title}</p>
                  </div>
                  {infoModal.data.description && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Description</p>
                      <p className="text-gray-900 dark:text-gray-100">{infoModal.data.description}</p>
                    </div>
                  )}
                  {infoModal.data.startDate && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Start Date</p>
                      <p className="text-gray-900 dark:text-gray-100">{new Date(infoModal.data.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {infoModal.data.endDate && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">End Date</p>
                      <p className="text-gray-900 dark:text-gray-100">{new Date(infoModal.data.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {infoModal.data.budgetUtilization && infoModal.data.budgetUtilization > 0 && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Budget Utilization</p>
                      <p className="text-gray-900 dark:text-gray-100">₱{infoModal.data.budgetUtilization.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  )}
                  {infoModal.data.sourceOfFund && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Source of Fund</p>
                      <p className="text-gray-900 dark:text-gray-100">{infoModal.data.sourceOfFund}</p>
                    </div>
                  )}
                  {infoModal.data.status && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        infoModal.data.status === 'Completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {infoModal.data.status}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {infoModal.type === 'project' && (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Title</p>
                    <p className="text-gray-900 dark:text-gray-100">{infoModal.data.title}</p>
                  </div>
                  {infoModal.data.description && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Description</p>
                      <p className="text-gray-900 dark:text-gray-100">{infoModal.data.description}</p>
                    </div>
                  )}
                  {infoModal.data.startDate && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Start Date</p>
                      <p className="text-gray-900 dark:text-gray-100">{new Date(infoModal.data.startDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {infoModal.data.endDate && (
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">End Date</p>
                      <p className="text-gray-900 dark:text-gray-100">{new Date(infoModal.data.endDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              {infoModal.type === 'activity' && (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">Basic Information</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-gray-500 font-medium">Title</p>
                          <p className="text-gray-900">{infoModal.data.title}</p>
                        </div>
                        {infoModal.data.location && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Location</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.location}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          {infoModal.data.startDate && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">Start Date</p>
                              <p className="text-gray-900 dark:text-gray-100">{new Date(infoModal.data.startDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {infoModal.data.endDate && (
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 font-medium">End Date</p>
                              <p className="text-gray-900 dark:text-gray-100">{new Date(infoModal.data.endDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        {infoModal.data.duration && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Duration</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.duration}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Organization & Implementation */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">Organization & Implementation</h3>
                      <div className="space-y-3 text-sm">
                        {infoModal.data.extensionAgenda && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Extension Agenda</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.extensionAgenda}</p>
                          </div>
                        )}
                        {infoModal.data.implementingCollege && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Implementing College</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.implementingCollege}</p>
                          </div>
                        )}
                        {infoModal.data.programsInvolved && infoModal.data.programsInvolved.length > 0 && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Programs Involved</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.programsInvolved.join(', ')}</p>
                          </div>
                        )}
                        {infoModal.data.facultyExtensionists && infoModal.data.facultyExtensionists.length > 0 && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Faculty Extensionists</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.facultyExtensionists.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Partnership & Support */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">Partnership & Support</h3>
                      <div className="space-y-3 text-sm">
                        {infoModal.data.partnerAgency && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Partner Agency</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.partnerAgency}</p>
                          </div>
                        )}
                        {infoModal.data.typeOfPartner && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Type of Partner</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.typeOfPartner}</p>
                          </div>
                        )}
                        {infoModal.data.supportProvided && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Support Provided</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.supportProvided}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">Financial</h3>
                      <div className="space-y-3 text-sm">
                        {infoModal.data.sourceOfFund && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Source of Fund</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.sourceOfFund}</p>
                          </div>
                        )}
                        {infoModal.data.totalCost >= 0 && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Total Cost</p>
                            <p className="text-gray-900 dark:text-gray-100">${infoModal.data.totalCost.toLocaleString()}</p>
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
                            <p className="text-gray-500 dark:text-gray-400 font-medium">SDGs Involved</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.sdgInvolved.map((id: string) => {
                              const sdg = SDG_LIST.find((s) => s.id === id)
                              return sdg ? sdg.name : id
                            }).join(', ')}</p>
                          </div>
                        )}
                        {infoModal.data.typeOfParticipant && infoModal.data.typeOfParticipant.length > 0 && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Type of Participants</p>
                            <p className="text-gray-900 dark:text-gray-100">{infoModal.data.typeOfParticipant.join(', ')}</p>
                          </div>
                        )}
                        {infoModal.data.beneficiaries?.total > 0 && (
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Beneficiaries</p>
                            <p className="text-gray-900 dark:text-gray-100">
                              Total: <span className="font-semibold">{infoModal.data.beneficiaries.total}</span>
                              <br />
                              <span className="text-xs text-gray-600 dark:text-gray-400">Male: {infoModal.data.beneficiaries.male} | Female: {infoModal.data.beneficiaries.female}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={() => setInfoModal(null)}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateModal
        isOpen={isCreateModalOpen}
        programs={programs}
        projects={projects}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProgram={handleCreateProgramFromModal}
        onCreateProject={handleCreateProjectFromModal}
        onCreateActivity={handleCreateActivityFromModal}
      />

      {/* End of Main Content Area */}
    </div>
  )
}



