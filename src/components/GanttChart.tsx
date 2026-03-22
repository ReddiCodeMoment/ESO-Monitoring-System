import { useMemo } from 'react'
import { Activity, Project } from '../types/index'

interface TimelineItem {
  id: string
  title: string
  startDate: string
  endDate: string
  type: 'project' | 'activity'
  status: string
  color: string
}

export function GanttChart({
  projects = [],
  activities = []
}: {
  projects?: Project[]
  activities?: Activity[]
}) {
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = []

    projects.forEach(p => items.push({
      id: p.id,
      title: `📊 ${p.title}`,
      startDate: p.startDate,
      endDate: p.endDate,
      type: 'project',
      status: p.status || 'On Going',
      color: p.status === 'Completed' ? '#10b981' : '#3b82f6'
    }))

    activities.forEach(a => items.push({
      id: a.id,
      title: `✅ ${a.title}`,
      startDate: a.startDate,
      endDate: a.endDate,
      type: 'activity',
      status: a.status || 'On Going',
      color: a.status === 'Completed' ? '#10b981' : '#06b6d4'
    }))

    // Sort by start date
    return items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }, [projects, activities])

  if (timelineItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <p className="text-gray-600 dark:text-gray-400 text-center">No projects or activities to display</p>
      </div>
    )
  }

  // Calculate date range
  const allDates = timelineItems.flatMap(item => [
    new Date(item.startDate),
    new Date(item.endDate)
  ])
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))

  // Add padding to date range
  minDate.setMonth(minDate.getMonth() - 1)
  maxDate.setMonth(maxDate.getMonth() + 1)

  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))

  const getPosition = (date: string) => {
    const d = new Date(date)
    return ((d.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * 100
  }

  const getWidth = (start: string, end: string) => {
    const startPos = getPosition(start)
    const endPos = getPosition(end)
    return Math.max(endPos - startPos, 2) // Minimum 2% width
  }

  // Generate month labels
  const months: { label: string; position: number }[] = []
  const current = new Date(minDate)
  while (current < maxDate) {
    months.push({
      label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      position: getPosition(current.toISOString().split('T')[0])
    })
    current.setMonth(current.getMonth() + 1)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project & Activity Timeline</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {totalDays} days • {timelineItems.length} items
        </p>
      </div>

      {/* Timeline Container */}
      <div className="overflow-x-auto">
        <div className="min-w-full p-6">
          {/* Month labels */}
          <div className="mb-4 pl-64 relative h-6">
            <div className="absolute inset-0 flex items-center border-b border-gray-200 dark:border-gray-700">
              {months.map((month, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 absolute"
                  style={{ left: `calc(16rem + ${month.position}%)` }}
                >
                  {month.label}
                </span>
              ))}
            </div>
          </div>

          {/* Timeline bars */}
          <div className="space-y-3">
            {timelineItems.map(item => (
              <div key={item.id} className="flex items-center h-8">
                {/* Title */}
                <div className="w-64 pr-4 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 relative h-8 bg-gray-100 dark:bg-gray-700 rounded">
                  <div
                    className="absolute h-full rounded transition-all hover:shadow-lg"
                    style={{
                      left: `${getPosition(item.startDate)}%`,
                      width: `${getWidth(item.startDate, item.endDate)}%`,
                      backgroundColor: item.color,
                      opacity: 0.8
                    }}
                    title={`${item.title}`}
                  />
                </div>

                {/* Status badge */}
                <div className="w-24 pl-4 flex-shrink-0">
                  <span 
                    className="text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                    style={{
                      backgroundColor: item.status === 'Completed' ? '#d1fae5' : '#dbeafe',
                      color: item.status === 'Completed' ? '#065f46' : '#1e3a8a'
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded" />
              <span className="text-gray-700 dark:text-gray-300">On Going Project</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 dark:bg-cyan-400 rounded" />
              <span className="text-gray-700 dark:text-gray-300">On Going Activity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 dark:bg-green-400 rounded" />
              <span className="text-gray-700 dark:text-gray-300">Completed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
