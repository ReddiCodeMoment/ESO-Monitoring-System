import { useState } from 'react'
import { ExtensionProgram, EXTENSION_AGENDAS, TYPE_OF_COMMUNITY_SERVICE, IMPLEMENTING_COLLEGES } from '../types'
import '../styles/modal.css'

interface CreateModalProps {
  isOpen: boolean
  selectedProgram: ExtensionProgram | null
  onClose: () => void
  onCreateProgram: (data: any) => Promise<void>
  onCreateProject: (data: any) => Promise<void>
  onCreateActivity: (data: any) => Promise<void>
}

export function CreateModal({ isOpen, selectedProgram, onClose, onCreateProgram, onCreateProject, onCreateActivity }: CreateModalProps) {
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [creationType, setCreationType] = useState<'program' | 'project' | 'activity' | null>(null)
  const [loading, setLoading] = useState(false)

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
  })

  // Project form state
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    extensionAgenda: '',
    typeOfCommunityService: '',
  })

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    duration: '',
    extensionAgenda: '',
  })

  const handleTypeSelect = (type: 'program' | 'project' | 'activity') => {
    if (type === 'project' && !selectedProgram) {
      alert('Please select a program first')
      return
    }
    if (type === 'activity' && !selectedProgram) {
      alert('Please select a program first')
      return
    }
    setCreationType(type)
    setStep('form')
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
        })
      } else if (creationType === 'project') {
        await onCreateProject(projectForm)
        setProjectForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          extensionAgenda: '',
          typeOfCommunityService: '',
        })
      } else if (creationType === 'activity') {
        await onCreateActivity(activityForm)
        setActivityForm({
          title: '',
          description: '',
          duration: '',
          extensionAgenda: '',
        })
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
                <span className="option-name">Program</span>
                <span className="option-desc">Extension program</span>
              </button>

              <button
                className="create-option-btn"
                onClick={() => handleTypeSelect('project')}
                disabled={!selectedProgram}
                title={selectedProgram ? 'Create a new project' : 'Select a program first'}
              >
                <span className="option-icon">📁</span>
                <span className="option-name">Project</span>
                <span className="option-desc">Program project</span>
              </button>

              <button
                className="create-option-btn"
                onClick={() => handleTypeSelect('activity')}
                disabled={!selectedProgram}
                title={selectedProgram ? 'Create a new activity' : 'Select a program first'}
              >
                <span className="option-icon">✓</span>
                <span className="option-name">Activity</span>
                <span className="option-desc">Project activity</span>
              </button>
            </div>
          </div>
        ) : creationType === 'program' ? (
          <div className="create-form">
            <h2>Create Program</h2>
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
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setStep('select')}>Back</button>
              <button className="btn-confirm" onClick={handleSubmit} disabled={loading || !programForm.title}>
                {loading ? 'Creating...' : 'Create Program'}
              </button>
            </div>
          </div>
        ) : creationType === 'project' ? (
          <div className="create-form">
            <h2>Create Project</h2>
            {selectedProgram && (
              <div className="form-info">
                <span>Program: <strong>{selectedProgram.title}</strong></span>
              </div>
            )}
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
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setStep('select')}>Back</button>
              <button className="btn-confirm" onClick={handleSubmit} disabled={loading || !projectForm.title}>
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        ) : (
          <div className="create-form">
            <h2>Create Activity</h2>
            {selectedProgram && (
              <div className="form-info">
                <span>Program: <strong>{selectedProgram.title}</strong></span>
              </div>
            )}
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
              <label>Description</label>
              <textarea
                value={activityForm.description}
                onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                placeholder="Activity description"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Duration (hours)</label>
              <input
                type="number"
                value={activityForm.duration}
                onChange={(e) => setActivityForm({ ...activityForm, duration: e.target.value })}
                placeholder="Hours"
              />
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
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setStep('select')}>Back</button>
              <button className="btn-confirm" onClick={handleSubmit} disabled={loading || !activityForm.title}>
                {loading ? 'Creating...' : 'Create Activity'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
