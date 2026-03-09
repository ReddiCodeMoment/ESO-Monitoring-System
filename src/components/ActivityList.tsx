import React, { useState, useEffect } from 'react'
import { Activity } from '../types'
import { getActivities, deleteActivity } from '../services/extensionService'

interface ActivityListProps {
  programId: string
  onEdit: (activity: Activity) => void
  onRefresh?: () => void
}

export function ActivityList({ programId, onEdit, onRefresh }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'beneficiaries'>('date')

  useEffect(() => {
    loadActivities()
  }, [programId])

  const loadActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getActivities(programId)
      setActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?'))
      return

    try {
      await deleteActivity(programId, activityId)
      setActivities((prev) =>
        prev.filter((a) => a.id !== activityId)
      )
      if (onRefresh) onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity')
    }
  }

  const getSortedActivities = () => {
    const sorted = [...activities]
    switch (sortBy) {
      case 'cost':
        return sorted.sort((a, b) => b.totalCost - a.totalCost)
      case 'beneficiaries':
        return sorted.sort((a, b) => b.beneficiaries.total - a.beneficiaries.total)
      case 'date':
      default:
        return sorted.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading activities...</div>
  }

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>
  }

  if (activities.length === 0) {
    return <div className="text-center py-8 text-gray-500">No activities found</div>
  }

  const sortedActivities = getSortedActivities()

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Activities ({activities.length})</h3>
        <div>
          <label className="text-sm font-medium mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'date' | 'cost' | 'beneficiaries')
            }
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="date">Date</option>
            <option value="cost">Total Cost</option>
            <option value="beneficiaries">Beneficiaries</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Title</th>
              <th className="px-6 py-3 text-left font-semibold">Location</th>
              <th className="px-6 py-3 text-left font-semibold">Dates</th>
              <th className="px-6 py-3 text-right font-semibold">Beneficiaries</th>
              <th className="px-6 py-3 text-right font-semibold">Cost</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedActivities.map((activity) => (
              <tr
                key={activity.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium max-w-xs truncate">
                  {activity.title}
                </td>
                <td className="px-6 py-4">{activity.location}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(activity.startDate).toLocaleDateString()} -{' '}
                  {new Date(activity.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {activity.beneficiaries.total}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  ${activity.totalCost.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      activity.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'approved'
                        ? 'bg-teal-100 text-teal-800'
                        : activity.status === 'submitted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {activity.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onEdit(activity)}
                    className="text-teal-600 hover:text-teal-800 mr-4 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-50 px-6 py-4 border-t grid grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-600">Total Activities</p>
          <p className="text-2xl font-bold">{activities.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Beneficiaries</p>
          <p className="text-2xl font-bold">
            {activities.reduce((sum, a) => sum + a.beneficiaries.total, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold">
            ${activities
              .reduce((sum, a) => sum + a.totalCost, 0)
              .toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Gender Breakdown</p>
          <p className="text-sm font-semibold">
            M:{' '}
            {activities.reduce((sum, a) => sum + a.beneficiaries.male, 0)} | F:{' '}
            {activities.reduce((sum, a) => sum + a.beneficiaries.female, 0)}
          </p>
        </div>
      </div>
    </div>
  )
}
