import React, { useState, useEffect } from 'react'
import {
  Activity,
  ActivityFormData,
  SDG_LIST,
  PARTNER_TYPES,
  PARTICIPANT_TYPES,
  FUND_SOURCES,
} from '../types'

interface ActivityFormProps {
  programId: string
  initialData?: Activity
  onSubmit: (data: ActivityFormData) => Promise<void>
  onCancel: () => void
}

export function ActivityForm({
  programId,
  initialData,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    extensionAgenda: '',
    duration: '',
    sdgInvolved: [],
    implementingCollege: '',
    programsInvolved: [],
    facultyExtensionists: [],
    partnerAgency: '',
    typeOfPartner: '',
    supportProvided: '',
    totalCost: '',
    sourceOfFund: '',
    typeOfParticipant: [],
    beneficiaries: {
      male: '',
      female: '',
      total: '',
    },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        location: initialData.location,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        extensionAgenda: initialData.extensionAgenda,
        duration: initialData.duration,
        sdgInvolved: initialData.sdgInvolved,
        implementingCollege: initialData.implementingCollege,
        programsInvolved: initialData.programsInvolved,
        facultyExtensionists: initialData.facultyExtensionists,
        partnerAgency: initialData.partnerAgency,
        typeOfPartner: initialData.typeOfPartner,
        supportProvided: initialData.supportProvided,
        totalCost: initialData.totalCost.toString(),
        sourceOfFund: initialData.sourceOfFund,
        typeOfParticipant: initialData.typeOfParticipant,
        beneficiaries: {
          male: initialData.beneficiaries.male.toString(),
          female: initialData.beneficiaries.female.toString(),
          total: initialData.beneficiaries.total.toString(),
        },
      })
    }
  }, [initialData])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBeneficiariesChange = (
    field: 'male' | 'female' | 'total',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      beneficiaries: {
        ...prev.beneficiaries,
        [field]: value,
      },
    }))
  }

  const handleSDGToggle = (sdgId: string) => {
    setFormData((prev) => ({
      ...prev,
      sdgInvolved: prev.sdgInvolved.includes(sdgId)
        ? prev.sdgInvolved.filter((id) => id !== sdgId)
        : [...prev.sdgInvolved, sdgId],
    }))
  }

  const handleMultiSelectToggle = (
    field: 'programsInvolved' | 'typeOfParticipant',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }))
  }

  const handleArrayInputChange = (
    field: 'facultyExtensionists',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(';').map((item) => item.trim()),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validation
      if (!formData.title.trim()) throw new Error('Activity title is required')
      if (!formData.location.trim()) throw new Error('Location is required')
      if (!formData.startDate) throw new Error('Start date is required')
      if (!formData.endDate) throw new Error('End date is required')
      if (formData.sdgInvolved.length === 0)
        throw new Error('Select at least one SDG')
      if (parseInt(formData.beneficiaries.total) <= 0)
        throw new Error('Total beneficiaries must be greater than 0')

      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto"
    >
      <h2 className="text-2xl font-bold mb-6">Activity Form</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <fieldset className="mb-8 border-b pb-6">
        <legend className="text-xl font-semibold mb-4">Basic Information</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <input
              type="text"
              name="duration"
              placeholder="e.g., 8 hours, 2 days, 3 months"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Extension Agenda
          </label>
          <textarea
            name="extensionAgenda"
            value={formData.extensionAgenda}
            onChange={handleInputChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </fieldset>

      {/* SDG Selection */}
      <fieldset className="mb-8 border-b pb-6">
        <legend className="text-xl font-semibold mb-4">
          Sustainable Development Goals *
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SDG_LIST.map((sdg) => (
            <label key={sdg.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.sdgInvolved.includes(sdg.id)}
                onChange={() => handleSDGToggle(sdg.id)}
                className="w-4 h-4"
              />
              <span className="text-sm">
                SDG {sdg.id}: {sdg.name}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Organization & Implementation */}
      <fieldset className="mb-8 border-b pb-6">
        <legend className="text-xl font-semibold mb-4">
          Organization & Implementation
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Implementing College
            </label>
            <input
              type="text"
              name="implementingCollege"
              value={formData.implementingCollege}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Source of Fund
            </label>
            <select
              name="sourceOfFund"
              value={formData.sourceOfFund}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select source...</option>
              {FUND_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Programs Involved
          </label>
          <input
            type="text"
            placeholder="Enter programs separated by semicolons (;)"
            value={formData.programsInvolved.join('; ')}
            onChange={(e) => {
              const programs = e.target.value
                .split(';')
                .map((p) => p.trim())
                .filter((p) => p)
              setFormData((prev) => ({
                ...prev,
                programsInvolved: programs,
              }))
            }}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            e.g., Program A; Program B; Program C
          </p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Faculty Extensionist(s)
          </label>
          <input
            type="text"
            placeholder="Enter faculty names separated by semicolons (;)"
            value={formData.facultyExtensionists.join('; ')}
            onChange={(e) => {
              const faculty = e.target.value
                .split(';')
                .map((f) => f.trim())
                .filter((f) => f)
              setFormData((prev) => ({
                ...prev,
                facultyExtensionists: faculty,
              }))
            }}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            e.g., Dr. Smith; Prof. Johnson; Ms. Brown
          </p>
        </div>
      </fieldset>

      {/* Partnership Details */}
      <fieldset className="mb-8 border-b pb-6">
        <legend className="text-xl font-semibold mb-4">Partnership Details</legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Partner Agency
            </label>
            <input
              type="text"
              name="partnerAgency"
              value={formData.partnerAgency}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Type of Partner
            </label>
            <select
              name="typeOfPartner"
              value={formData.typeOfPartner}
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select type...</option>
              {PARTNER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">
            Support Provided
          </label>
          <textarea
            name="supportProvided"
            value={formData.supportProvided}
            onChange={handleInputChange}
            rows={2}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </fieldset>

      {/* Financial Information */}
      <fieldset className="mb-8 border-b pb-6">
        <legend className="text-xl font-semibold mb-4">Financial Information</legend>

        <div>
          <label className="block text-sm font-medium mb-1">Total Cost</label>
          <input
            type="number"
            name="totalCost"
            value={formData.totalCost}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </fieldset>

      {/* Participants & Beneficiaries */}
      <fieldset className="mb-8 border-b pb-6">
        <legend className="text-xl font-semibold mb-4">
          Participants & Beneficiaries
        </legend>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Type of Participant
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PARTICIPANT_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.typeOfParticipant.includes(type)}
                  onChange={() =>
                    handleMultiSelectToggle('typeOfParticipant', type)
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Male Beneficiaries
            </label>
            <input
              type="number"
              value={formData.beneficiaries.male}
              onChange={(e) =>
                handleBeneficiariesChange('male', e.target.value)
              }
              min="0"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Female Beneficiaries
            </label>
            <input
              type="number"
              value={formData.beneficiaries.female}
              onChange={(e) =>
                handleBeneficiariesChange('female', e.target.value)
              }
              min="0"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Total Beneficiaries *
            </label>
            <input
              type="number"
              value={formData.beneficiaries.total}
              onChange={(e) =>
                handleBeneficiariesChange('total', e.target.value)
              }
              min="0"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
      </fieldset>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Activity'}
        </button>
      </div>
    </form>
  )
}
