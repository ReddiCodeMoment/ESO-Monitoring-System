import { useState, useEffect } from 'react'
import { ExtensionProgram, Activity } from '../types'
import { getExtensionPrograms, getActivities, createActivity, updateActivity } from '../services/extensionService'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ActivityForm } from './ActivityForm'
import { ActivityList } from './ActivityList'

export function DataManagement() {
  const { setNotification } = useApp()
  const { user } = useAuth()
  const [programs, setPrograms] = useState<ExtensionProgram[]>([])
  const [selectedProgram, setSelectedProgram] = useState<ExtensionProgram | null>(null)
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    loadPrograms()
  }, [])

  useEffect(() => {
    if (selectedProgram) {
      loadActivities(selectedProgram.id)
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

  const loadActivities = async (programId: string) => {
    try {
      const data = await getActivities(programId)
      setActivities(data)
    } catch (error) {
      setNotification({ type: 'error', text: 'Failed to load activities' })
      console.error('Error:', error)
    }
  }

  const handleSubmitActivity = async (formData: any) => {
    if (!selectedProgram) return

    try {
      if (editingActivity) {
        // Update existing activity
        await updateActivity(selectedProgram.id, editingActivity.id, {
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
        await createActivity(selectedProgram.id, {
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

      loadActivities(selectedProgram.id)
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

      {view === 'list' ? (
        <div>
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
            onEdit={(activity) => {
              setEditingActivity(activity)
              setView('form')
            }}
            onRefresh={() => loadActivities(selectedProgram.id)}
          />
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

          <ActivityForm
            programId={selectedProgram.id}
            initialData={editingActivity || undefined}
            onSubmit={handleSubmitActivity}
            onCancel={() => {
              setEditingActivity(null)
              setView('list')
            }}
          />
        </div>
      )}
    </div>
  )
}
