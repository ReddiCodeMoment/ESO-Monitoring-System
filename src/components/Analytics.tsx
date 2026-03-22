import { useMemo } from 'react'
import { ExtensionProgram, Project, Activity, SDG_LIST } from '../types/index'

export function Analytics({
  programs,
  projects,
  activities
}: {
  programs: ExtensionProgram[]
  projects: Project[]
  activities: Activity[]
}) {
  const stats = useMemo(() => {
    const totalPrograms = programs.length
    const completedPrograms = programs.filter(p => p.status === 'Completed').length
    const onGoingPrograms = programs.filter(p => p.status === 'On Going').length

    const totalProjects = projects.length
    const completedProjects = projects.filter(p => p.status === 'Completed').length
    const onGoingProjects = projects.filter(p => p.status === 'On Going').length

    const totalActivities = activities.length
    const completedActivities = activities.filter(a => a.status === 'Completed').length
    const onGoingActivities = activities.filter(a => a.status === 'On Going').length

    // Calculate SDG coverage
    const sdgCoverage = new Set<string>()
    programs.forEach(p => p.sdgInvolved?.forEach(sdg => sdgCoverage.add(sdg)))
    projects.forEach(p => p.sdgInvolved?.forEach(sdg => sdgCoverage.add(sdg)))
    activities.forEach(a => a.sdgInvolved?.forEach(sdg => sdgCoverage.add(sdg)))

    // SDG breakdown
    const sdgBreakdown = SDG_LIST.map(sdg => ({
      ...sdg,
      count: [
        ...programs.filter(p => p.sdgInvolved?.includes(sdg.id)),
        ...projects.filter(p => p.sdgInvolved?.includes(sdg.id)),
        ...activities.filter(a => a.sdgInvolved?.includes(sdg.id))
      ].length
    })).filter(s => s.count > 0)

    // Calculate total cost
    const totalBudget = activities.reduce((sum, a) => sum + (a.totalCost || 0), 0)

    // Calculate total beneficiaries
    const totalBeneficiaries = activities.reduce((sum, a) => sum + (a.beneficiaries?.total || 0), 0)
    const maleCount = activities.reduce((sum, a) => sum + (a.beneficiaries?.male || 0), 0)
    const femaleCount = activities.reduce((sum, a) => sum + (a.beneficiaries?.female || 0), 0)

    return {
      totalPrograms,
      completedPrograms,
      onGoingPrograms,
      programCompletion: totalPrograms > 0 ? Math.round((completedPrograms / totalPrograms) * 100) : 0,
      
      totalProjects,
      completedProjects,
      onGoingProjects,
      projectCompletion: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
      
      totalActivities,
      completedActivities,
      onGoingActivities,
      activityCompletion: totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0,

      sdgCoverageLevels: sdgCoverage.size,
      sdgTotal: SDG_LIST.length,
      sdgBreakdown: sdgBreakdown.sort((a, b) => b.count - a.count),

      totalBudget,
      totalBeneficiaries,
      maleCount,
      femaleCount,
      malePercentage: totalBeneficiaries > 0 ? Math.round((maleCount / totalBeneficiaries) * 100) : 0
    }
  }, [programs, projects, activities])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of all programs and activities</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Programs Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Programs</p>
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalPrograms}</p>
          <div className="mt-3 flex gap-3 text-xs">
            <span className="text-green-600 dark:text-green-400">{stats.completedPrograms} Completed</span>
            <span className="text-blue-600 dark:text-blue-400">{stats.onGoingPrograms} On Going</span>
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all"
              style={{ width: `${stats.programCompletion}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stats.programCompletion}% Complete</p>
        </div>

        {/* Projects Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border-l-4 border-l-purple-500">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Projects</p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProjects}</p>
          <div className="mt-3 flex gap-3 text-xs">
            <span className="text-green-600 dark:text-green-400">{stats.completedProjects} Completed</span>
            <span className="text-blue-600 dark:text-blue-400">{stats.onGoingProjects} On Going</span>
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all"
              style={{ width: `${stats.projectCompletion}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stats.projectCompletion}% Complete</p>
        </div>

        {/* Activities Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border-l-4 border-l-teal-500">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Activities</p>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalActivities}</p>
          <div className="mt-3 flex gap-3 text-xs">
            <span className="text-green-600 dark:text-green-400">{stats.completedActivities} Completed</span>
            <span className="text-blue-600 dark:text-blue-400">{stats.onGoingActivities} On Going</span>
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all"
              style={{ width: `${stats.activityCompletion}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stats.activityCompletion}% Complete</p>
        </div>

        {/* SDG Coverage Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border-l-4 border-l-orange-500">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">SDG Coverage</p>
            <span className="text-2xl">🌍</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.sdgCoverageLevels}/{stats.sdgTotal}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">SDGs Covered</p>
          <div className="mt-3 text-xs">
            <span className="inline-block bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
              {Math.round((stats.sdgCoverageLevels / stats.sdgTotal) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Budget Allocated</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ₱{(stats.totalBudget / 1_000_000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{stats.totalActivities} activities</p>
        </div>

        {/* Beneficiaries Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Total Beneficiaries</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {(stats.totalBeneficiaries / 1000).toFixed(1)}K
          </p>
          <div className="mt-2 flex gap-3 text-xs">
            <span className="text-blue-600 dark:text-blue-400">♂️ {stats.maleCount.toLocaleString()}</span>
            <span className="text-pink-600 dark:text-pink-400">♀️ {stats.femaleCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Gender Distribution Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Gender Distribution</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-xs text-blue-600 dark:text-blue-400 mr-2">Male</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stats.malePercentage}%` }} />
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-pink-600 dark:text-pink-400 mr-2">Female</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                  <div className="bg-pink-500 h-full rounded-full" style={{ width: `${100 - stats.malePercentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SDG Breakdown */}
      {stats.sdgBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top SDGs Engaged</h2>
          <div className="space-y-2">
            {stats.sdgBreakdown.slice(0, 10).map(sdg => (
              <div key={sdg.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    SDG {sdg.id}: {sdg.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (sdg.count / Math.max(stats.totalActivities, 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-12 text-right">
                    {sdg.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
