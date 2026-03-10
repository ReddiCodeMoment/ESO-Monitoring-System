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
  initialData?: Activity
  onSubmit: (data: ActivityFormData) => Promise<void>
  onCancel: () => void
}

export function ActivityForm({
  initialData,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 5

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
    }
  }

  const handleNext = () => {
    // Validate current page before proceeding
    if (currentPage === 1) {
      if (!formData.title.trim()) {
        setError('Activity title is required')
        return
      }
      if (!formData.location.trim()) {
        setError('Location is required')
        return
      }
      if (!formData.startDate) {
        setError('Start date is required')
        return
      }
      if (!formData.endDate) {
        setError('End date is required')
        return
      }
    } else if (currentPage === 2) {
      if (formData.sdgInvolved.length === 0) {
        setError('Select at least one SDG')
        return
      }
    } else if (currentPage === 5) {
      if (parseInt(formData.beneficiaries.total) <= 0) {
        setError('Total beneficiaries must be greater than 0')
        return
      }
    }

    setError(null)
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrev = () => {
    setError(null)
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Activity Form</h2>
          <span className="text-sm font-semibold text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Page 1: Basic Information */}
      {currentPage === 1 && (
        <fieldset>
          <legend className="text-xl font-semibold mb-4">Basic Information</legend>
          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Extension Agenda
              </label>
              <textarea
                name="extensionAgenda"
                value={formData.extensionAgenda}
                onChange={handleInputChange}
                rows={4}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* Page 2: SDG Selection */}
      {currentPage === 2 && (
        <fieldset>
          <legend className="text-xl font-semibold mb-4">
            Sustainable Development Goals *
          </legend>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {SDG_LIST.map((sdg) => (
              <label key={sdg.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
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
      )}

      {/* Page 3: Organization & Implementation */}
      {currentPage === 3 && (
        <fieldset>
          <legend className="text-xl font-semibold mb-4">
            Organization & Implementation
          </legend>
          <div className="space-y-4">
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

            <div>
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

            <div>
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
          </div>
        </fieldset>
      )}

      {/* Page 4: Partnership & Financial */}
      {currentPage === 4 && (
        <fieldset>
          <legend className="text-xl font-semibold mb-4">
            Partnership & Financial Information
          </legend>
          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Support Provided
              </label>
              <textarea
                name="supportProvided"
                value={formData.supportProvided}
                onChange={handleInputChange}
                rows={3}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Total Cost
              </label>
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
          </div>
        </fieldset>
      )}

      {/* Page 5: Participants & Beneficiaries */}
      {currentPage === 5 && (
        <fieldset>
          <legend className="text-xl font-semibold mb-4">
            Participants & Beneficiaries
          </legend>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Type of Participant
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {PARTICIPANT_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
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

            <div>
              <label className="block text-sm font-medium mb-2">
                Beneficiaries Breakdown
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Male
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
                  <label className="block text-xs font-medium mb-1">
                    Female
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
                  <label className="block text-xs font-medium mb-1">
                    Total *
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
            </div>
          </div>
        </fieldset>
      )}

      {/* Form Actions */}
      <div className="flex gap-4 justify-between mt-8">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          {currentPage > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
            >
              ← Previous
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {currentPage < totalPages && (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Next →
            </button>
          )}
          {currentPage === totalPages && (
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
            >
              Save Activity
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
