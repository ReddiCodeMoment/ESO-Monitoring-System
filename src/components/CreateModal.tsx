import { useState } from 'react'
import { ExtensionProgram, Project, SDG_LIST, EXTENSION_AGENDAS, TYPE_OF_COMMUNITY_SERVICE, IMPLEMENTING_COLLEGES, TYPE_OF_BENEFICIARIES, PROGRAM_STATUS } from '../types'
import '../styles/modal.css'

interface CreateModalProps {
  isOpen: boolean
  programs: ExtensionProgram[]
  projects: Map<string, Project[]>
  onClose: () => void
  onCreateProgram: (data: any) => Promise<void>
  onCreateProject: (data: any) => Promise<void>
  onCreateActivity: (data: any) => Promise<void>
}

export function CreateModal({ isOpen, programs, projects, onClose, onCreateProgram, onCreateProject, onCreateActivity }: CreateModalProps) {
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [creationType, setCreationType] = useState<'program' | 'project' | 'activity' | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedParentProgram, setSelectedParentProgram] = useState<string>('')
  const [selectedParentProject, setSelectedParentProject] = useState<string>('')
  const [programPage, setProgramPage] = useState(1)

  // Program form state
  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    color: '#3B82F6',
    implementingCollege: '',
    extensionAgenda: '',
    typeOfCommunityService: '',
    status: '' as string,
    budgetUtilization: 0,
    sourceOfFund: '',
    sdgInvolved: [] as string[],
    typeOfBeneficiaries: '' as string,
    beneficiaries: {
      male: 0,
      female: 0,
      total: 0,
      unspecified: false,
    },
  })

  // Project form state
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    extensionAgenda: '',
    typeOfCommunityService: '',
    sdgInvolved: [] as string[],
  })

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    extensionAgenda: '',
    typeOfCommunityService: '',
  })

  const handleTypeSelect = (type: 'program' | 'project' | 'activity') => {
    setCreationType(type)
    setStep('form')
    if (type === 'program') {
      setProgramPage(1)
    }
  }

  const handleProgramPageNext = () => {
    setProgramPage((prev) => Math.min(prev + 1, 3))
  }

  const handleProgramPagePrev = () => {
    setProgramPage((prev) => Math.max(prev - 1, 1))
  }

  const handleSDGToggle = (sdgId: string) => {
    setProgramForm((prev) => ({
      ...prev,
      sdgInvolved: prev.sdgInvolved.includes(sdgId)
        ? prev.sdgInvolved.filter((id) => id !== sdgId)
        : [...prev.sdgInvolved, sdgId],
    }))
  }

  const handleProjectSDGToggle = (sdgId: string) => {
    setProjectForm((prev) => ({
      ...prev,
      sdgInvolved: prev.sdgInvolved.includes(sdgId)
        ? prev.sdgInvolved.filter((id) => id !== sdgId)
        : [...prev.sdgInvolved, sdgId],
    }))
  }


  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (creationType === 'program') {
        await onCreateProgram(programForm)
        setProgramForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          color: '#3B82F6',
          implementingCollege: '',
          extensionAgenda: '',
          typeOfCommunityService: '',
          status: '',
          budgetUtilization: 0,
          sourceOfFund: '',
          sdgInvolved: [],
          typeOfBeneficiaries: '',
          beneficiaries: {
            male: 0,
            female: 0,
            total: 0,
            unspecified: false,
          },
        })
        setProgramPage(1)
      } else if (creationType === 'project') {
        await onCreateProject({
          ...projectForm,
          parentProgramId: selectedParentProgram,
        })
        setProjectForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          extensionAgenda: '',
          typeOfCommunityService: '',
          sdgInvolved: [],
        })
        setSelectedParentProgram('')
      } else if (creationType === 'activity') {
        await onCreateActivity({
          ...activityForm,
          parentProgramId: selectedParentProgram,
          parentProjectId: selectedParentProject,
        })
        setActivityForm({
          title: '',
          location: '',
          startDate: '',
          endDate: '',
          extensionAgenda: '',
          typeOfCommunityService: '',
        })
        setSelectedParentProgram('')
        setSelectedParentProject('')
      }
      handleClose()
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('select')
    setCreationType(null)
    setProgramPage(1)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>

        {step === 'select' ? (
          <div className="create-select">
            <h2>Create New Item</h2>
            <p className="modal-subtitle">What would you like to create?</p>

            <div className="create-options">
              <button
                className="create-option-btn"
                onClick={() => handleTypeSelect('program')}
                title="Create a new extension program"
              >
                <span className="option-icon">📊</span>
                <div>
                  <span className="option-name">Program</span>
                  <span className="option-desc">Extension program</span>
                </div>
              </button>

              <button
                className="create-option-btn"
                onClick={() => handleTypeSelect('project')}
                title="Create a new project"
              >
                <span className="option-icon">📁</span>
                <div>
                  <span className="option-name">Project</span>
                  <span className="option-desc">Program project</span>
                </div>
              </button>

              <button
                className="create-option-btn"
                onClick={() => handleTypeSelect('activity')}
                title="Create a new activity"
              >
                <span className="option-icon">✓</span>
                <div>
                  <span className="option-name">Activity</span>
                  <span className="option-desc">Project activity</span>
                </div>
              </button>
            </div>
          </div>
        ) : creationType === 'program' ? (
          <div className="create-form">
            <h2>Create Program</h2>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-medium">Step {programPage} of 3</span>
                <span className="text-gray-600">
                  {programPage === 1 && 'Basic Information'}
                  {programPage === 2 && 'Configuration'}
                  {programPage === 3 && 'Impact & Beneficiaries'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-500 h-full transition-all duration-300"
                  style={{ width: `${(programPage / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Page 1: Basic Information */}
            {programPage === 1 && (
              <div className="space-y-4">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={programForm.title}
                    onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                    placeholder="Program title"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={programForm.description}
                    onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                    placeholder="Program description"
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={programForm.startDate}
                      onChange={(e) => setProgramForm({ ...programForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={programForm.endDate}
                      onChange={(e) => setProgramForm({ ...programForm, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Program Color</label>
                  <input
                    type="color"
                    value={programForm.color}
                    onChange={(e) => setProgramForm({ ...programForm, color: e.target.value })}
                    className="w-full h-10 border rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Page 2: Configuration */}
            {programPage === 2 && (
              <div className="space-y-4">
                <div className="form-group">
                  <label>Implementing College</label>
                  <select
                    value={programForm.implementingCollege}
                    onChange={(e) => setProgramForm({ ...programForm, implementingCollege: e.target.value })}
                  >
                    <option value="">-- Select College --</option>
                    {IMPLEMENTING_COLLEGES.map((college) => (
                      <option key={college} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Extension Agenda</label>
                  <select
                    value={programForm.extensionAgenda}
                    onChange={(e) => setProgramForm({ ...programForm, extensionAgenda: e.target.value })}
                  >
                    <option value="">-- Select Agenda --</option>
                    {EXTENSION_AGENDAS.map((agenda) => (
                      <option key={agenda} value={agenda}>
                        {agenda}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type of Community Service</label>
                  <select
                    value={programForm.typeOfCommunityService}
                    onChange={(e) => setProgramForm({ ...programForm, typeOfCommunityService: e.target.value })}
                  >
                    <option value="">-- Select Type --</option>
                    {TYPE_OF_COMMUNITY_SERVICE.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Budget Utilization (PHP)</label>
                  <input
                    type="number"
                    value={programForm.budgetUtilization}
                    onChange={(e) => setProgramForm({ ...programForm, budgetUtilization: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 border rounded"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Source of Fund</label>
                  <input
                    type="text"
                    value={programForm.sourceOfFund}
                    onChange={(e) => setProgramForm({ ...programForm, sourceOfFund: e.target.value })}
                    className="w-full p-2 border rounded"
                    placeholder="e.g., Government, Private, NGO"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={programForm.status}
                    onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
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
            )}

            {/* Page 3: Impact & Beneficiaries */}
            {programPage === 3 && (
              <div className="space-y-4">
                {/* SDG Checklist */}
                <div className="form-group">
                  <label>Sustainable Development Goals (SDGs)</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded bg-gray-50">
                    {SDG_LIST.map((sdg) => (
                      <label key={sdg.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white rounded">
                        <input
                          type="checkbox"
                          checked={programForm.sdgInvolved.includes(sdg.id)}
                          onChange={() => handleSDGToggle(sdg.id)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm">{sdg.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Beneficiaries Section */}
                <div className="form-group">
                  <label>Beneficiaries</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={programForm.beneficiaries.unspecified}
                        onChange={(e) =>
                          setProgramForm({
                            ...programForm,
                            beneficiaries: {
                              ...programForm.beneficiaries,
                              unspecified: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Not specified (just total count)</span>
                    </label>
                    {!programForm.beneficiaries.unspecified && (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Male</label>
                          <input
                            type="number"
                            min="0"
                            value={programForm.beneficiaries.male}
                            onChange={(e) =>
                              setProgramForm({
                                ...programForm,
                                beneficiaries: {
                                  ...programForm.beneficiaries,
                                  male: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Female</label>
                          <input
                            type="number"
                            min="0"
                            value={programForm.beneficiaries.female}
                            onChange={(e) =>
                              setProgramForm({
                                ...programForm,
                                beneficiaries: {
                                  ...programForm.beneficiaries,
                                  female: parseInt(e.target.value) || 0,
                                },
                              })
                            }
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Total</label>
                          <div className="w-full px-2 py-1 border rounded bg-gray-100 text-sm">
                            {programForm.beneficiaries.male + programForm.beneficiaries.female}
                          </div>
                        </div>
                      </div>
                    )}
                    {programForm.beneficiaries.unspecified && (
                      <div>
                        <label className="text-xs font-medium text-gray-600">Total Beneficiaries</label>
                        <input
                          type="number"
                          min="0"
                          value={programForm.beneficiaries.total || 0}
                          onChange={(e) =>
                            setProgramForm({
                              ...programForm,
                              beneficiaries: {
                                ...programForm.beneficiaries,
                                total: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full px-2 py-1 border rounded text-sm"
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Beneficiary Type Selection */}
                <div className="form-group">
                  <label>Type of Beneficiaries</label>
                  <select
                    value={programForm.typeOfBeneficiaries}
                    onChange={(e) => setProgramForm({ ...programForm, typeOfBeneficiaries: e.target.value })}
                  >
                    <option value="">-- Select Beneficiary Type --</option>
                    {TYPE_OF_BENEFICIARIES.map((beneficiaryType) => (
                      <option key={beneficiaryType} value={beneficiaryType}>
                        {beneficiaryType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setStep('select')}>
                Cancel
              </button>
              {programPage > 1 && (
                <button className="btn-cancel" onClick={handleProgramPagePrev}>
                  Previous
                </button>
              )}
              {programPage < 3 && (
                <button className="btn-confirm" onClick={handleProgramPageNext}>
                  Next
                </button>
              )}
              {programPage === 3 && (
                <button className="btn-confirm" onClick={handleSubmit} disabled={loading || !programForm.title}>
                  {loading ? 'Creating...' : 'Create Program'}
                </button>
              )}
            </div>
          </div>
        ) : creationType === 'project' ? (
          <div className="create-form">
            <h2>Create Project</h2>
            <div className="form-group">
              <label>Parent Program *</label>
              <select
                value={selectedParentProgram}
                onChange={(e) => setSelectedParentProgram(e.target.value)}
              >
                <option value="">-- Select a Program --</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="Project title"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Project description"
                rows={3}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Extension Agenda</label>
              <select
                value={projectForm.extensionAgenda}
                onChange={(e) => setProjectForm({ ...projectForm, extensionAgenda: e.target.value })}
              >
                <option value="">-- Select Agenda --</option>
                {EXTENSION_AGENDAS.map((agenda) => (
                  <option key={agenda} value={agenda}>
                    {agenda}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type of Community Service</label>
              <select
                value={projectForm.typeOfCommunityService}
                onChange={(e) => setProjectForm({ ...projectForm, typeOfCommunityService: e.target.value })}
              >
                <option value="">-- Select Type --</option>
                {TYPE_OF_COMMUNITY_SERVICE.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Sustainable Development Goals (SDGs)</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded bg-gray-50">
                {SDG_LIST.map((sdg) => (
                  <label key={sdg.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white rounded">
                    <input
                      type="checkbox"
                      checked={projectForm.sdgInvolved.includes(sdg.id)}
                      onChange={() => handleProjectSDGToggle(sdg.id)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">{sdg.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setStep('select')}>Back</button>
              <button className="btn-confirm" onClick={handleSubmit} disabled={loading || !projectForm.title || !selectedParentProgram}>
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        ) : (
          <div className="create-form">
            <h2>Create Activity</h2>
            <div className="form-group">
              <label>Parent Program *</label>
              <select
                value={selectedParentProgram}
                onChange={(e) => {
                  setSelectedParentProgram(e.target.value)
                  setSelectedParentProject('')
                }}
              >
                <option value="">-- Select a Program --</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Parent Project *</label>
              <select
                value={selectedParentProject}
                onChange={(e) => setSelectedParentProject(e.target.value)}
                disabled={!selectedParentProgram || (projects.get(selectedParentProgram) || []).length === 0}
              >
                <option value="">-- Select a Project --</option>
                {selectedParentProgram && (projects.get(selectedParentProgram) || []).map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={activityForm.title}
                onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                placeholder="Activity title"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={activityForm.location}
                onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                placeholder="Activity location"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={activityForm.startDate}
                  onChange={(e) => setActivityForm({ ...activityForm, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={activityForm.endDate}
                  onChange={(e) => setActivityForm({ ...activityForm, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Extension Agenda</label>
              <select
                value={activityForm.extensionAgenda}
                onChange={(e) => setActivityForm({ ...activityForm, extensionAgenda: e.target.value })}
              >
                <option value="">-- Select Agenda --</option>
                {EXTENSION_AGENDAS.map((agenda) => (
                  <option key={agenda} value={agenda}>
                    {agenda}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type of Community Service</label>
              <select
                value={activityForm.typeOfCommunityService}
                onChange={(e) => setActivityForm({ ...activityForm, typeOfCommunityService: e.target.value })}
              >
                <option value="">-- Select Type --</option>
                {TYPE_OF_COMMUNITY_SERVICE.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setStep('select')}>Back</button>
              <button className="btn-confirm" onClick={handleSubmit} disabled={loading || !activityForm.title || !selectedParentProgram || !selectedParentProject}>
                {loading ? 'Creating...' : 'Create Activity'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
