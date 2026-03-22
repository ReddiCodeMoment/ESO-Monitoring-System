// Pagination utilities
export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, items.length)
  return items.slice(startIndex, endIndex)
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize)
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  windowSize: number = 5
) {
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)

  // Adjust start if we're too close to the end
  if (end - start < windowSize - 1) {
    start = Math.max(1, end - windowSize + 1)
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}
