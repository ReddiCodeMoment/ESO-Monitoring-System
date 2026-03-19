import { useState, useEffect } from 'react'
import { Activity } from '../types'
import { getActivitiesByProjectId, deleteActivity } from '../services/extensionService'
import { useNotification } from '../context/NotificationContext'

interface ActivityListProps {
  programId: string
  projectId: string
  onEdit: (activity: Activity) => void
  onRefresh?: () => void
}

export function ActivityList({ programId, projectId, onEdit, onRefresh }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'beneficiaries'>('date')
  const { showError, showSuccess } = useNotification()

  useEffect(() => {
    loadActivities()
  }, [programId, projectId])

  const loadActivities = async () => {
    try {
      setError(null)
      const data = await getActivitiesByProjectId(programId, projectId)
      setActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities')
    }
  }

  const handleDelete = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?'))
      return

    try {
      const activity = activities.find(a => a.id === activityId)
      await deleteActivity(programId, projectId, activityId)
      setActivities((prev) =>
        prev.filter((a) => a.id !== activityId)
      )
      if (onRefresh) onRefresh()
      showSuccess('Activity deleted', `"${activity?.title}" has been removed`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete activity'
      setError(message)
      showError('Deletion failed', message)
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

  if (error) {
    return <div className="text-red-600 text-center py-8">{error}</div>
  }

  if (activities.length === 0) {
    return <div className="text-center py-8 text-gray-500">No activities found</div>
  }

  const sortedActivities = getSortedActivities()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Activities ({activities.length})</h3>
        <div>
          <label className="text-sm font-medium mr-2">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'date' | 'cost' | 'beneficiaries')
            }
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="date">Date</option>
            <option value="cost">Total Cost</option>
            <option value="beneficiaries">Beneficiaries</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Title</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Location</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Dates</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">Beneficiaries</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">Cost</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Status</th>
              <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedActivities.map((activity) => (
              <tr
                key={activity.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <td className="px-6 py-4 font-medium max-w-xs truncate">
                  {activity.title}
                </td>
                <td className="px-6 py-4">{activity.location}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
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
                      activity.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : activity.status === 'On Going'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {activity.status || 'No Status'}
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
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t dark:border-gray-600 grid grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Total Activities</p>
          <p className="text-2xl font-bold">{activities.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Total Beneficiaries</p>
          <p className="text-2xl font-bold">
            {activities.reduce((sum, a) => sum + a.beneficiaries.total, 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Total Cost</p>
          <p className="text-2xl font-bold">
            ${activities
              .reduce((sum, a) => sum + a.totalCost, 0)
              .toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Gender Breakdown</p>
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
