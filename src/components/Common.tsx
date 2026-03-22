import React from 'react'

// Empty State Component
export function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-5xl">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}

// Loading Skeleton Component
export function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// Skeleton Card for specific layout
export function SkeletonCard() {
  return (
    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-5/6" />
    </div>
  )
}

// Pagination Component
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || disabled}
        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1
          const showPage = Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages

          if (!showPage && currentPage > 3 && page === 2) {
            return <span key="ellipsis-start">...</span>
          }
          if (!showPage && currentPage < totalPages - 2 && page === totalPages - 1) {
            return <span key="ellipsis-end">...</span>
          }
          if (!showPage) return null

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className={`px-2.5 py-1 text-sm rounded ${
                page === currentPage
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {page}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || disabled}
        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  )
}
