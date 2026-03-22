import { useState } from 'react'
import { IMPLEMENTING_COLLEGES, SDG_LIST, PROGRAM_STATUS, FUND_SOURCES } from '../types/index'

export interface FilterState {
  status?: string[]
  location?: string
  college?: string[]
  startDateRange?: { from: string; to: string }
  sdgs?: string[]
  sourceOfFund?: string[]
  searchText?: string
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onClose
}: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClose?: () => void
}) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters)

  const handleStatusToggle = (status: string) => {
    const current = localFilters.status || []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    setLocalFilters({ ...localFilters, status: updated.length > 0 ? updated : undefined })
  }

  const handleCollegeToggle = (college: string) => {
    const current = localFilters.college || []
    const updated = current.includes(college)
      ? current.filter(c => c !== college)
      : [...current, college]
    setLocalFilters({ ...localFilters, college: updated.length > 0 ? updated : undefined })
  }

  const handleSdgToggle = (sdg: string) => {
    const current = localFilters.sdgs || []
    const updated = current.includes(sdg)
      ? current.filter(s => s !== sdg)
      : [...current, sdg]
    setLocalFilters({ ...localFilters, sdgs: updated.length > 0 ? updated : undefined })
  }

  const handleFundToggle = (fund: string) => {
    const current = localFilters.sourceOfFund || []
    const updated = current.includes(fund)
      ? current.filter(f => f !== fund)
      : [...current, fund]
    setLocalFilters({ ...localFilters, sourceOfFund: updated.length > 0 ? updated : undefined })
  }

  const handleApply = () => {
    onFiltersChange(localFilters)
    onClose?.()
  }

  const handleReset = () => {
    setLocalFilters({})
    onFiltersChange({})
    onClose?.()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Text */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Search
        </label>
        <input
          type="text"
          value={localFilters.searchText || ''}
          onChange={(e) => setLocalFilters({ ...localFilters, searchText: e.target.value || undefined })}
          placeholder="Search by title, location..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Status
        </label>
        <div className="space-y-2">
          {PROGRAM_STATUS.map(status => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.status?.includes(status) || false}
                onChange={() => handleStatusToggle(status)}
                className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-2 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Location
        </label>
        <input
          type="text"
          value={localFilters.location || ''}
          onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value || undefined })}
          placeholder="Enter location..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* College Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Implementing College
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {IMPLEMENTING_COLLEGES.map(college => (
            <label key={college} className="flex items-start">
              <input
                type="checkbox"
                checked={localFilters.college?.includes(college) || false}
                onChange={() => handleCollegeToggle(college)}
                className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-2 focus:ring-teal-500 mt-0.5"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{college}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fund Source Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Source of Fund
        </label>
        <div className="space-y-2">
          {FUND_SOURCES.map(fund => (
            <label key={fund} className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.sourceOfFund?.includes(fund) || false}
                onChange={() => handleFundToggle(fund)}
                className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-2 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{fund}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SDG Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          SDGs
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {SDG_LIST.map(sdg => (
            <label key={sdg.id} className="flex items-center">
              <input
                type="checkbox"
                checked={localFilters.sdgs?.includes(sdg.id) || false}
                onChange={() => handleSdgToggle(sdg.id)}
                className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-2 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                SDG {sdg.id}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={localFilters.startDateRange?.from || ''}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              startDateRange: { ...localFilters.startDateRange, from: e.target.value } as any
            })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <input
            type="date"
            value={localFilters.startDateRange?.to || ''}
            onChange={(e) => setLocalFilters({
              ...localFilters,
              startDateRange: { ...localFilters.startDateRange, to: e.target.value } as any
            })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
