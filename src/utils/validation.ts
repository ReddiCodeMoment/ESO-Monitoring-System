// Validation utilities for form inputs
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Program validation
export function validateProgram(data: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Program title is required' })
  } else if (data.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be 200 characters or less' })
  }

  if (!data.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' })
  }

  if (!data.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required' })
  }

  if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' })
  }

  if (!data.implementingCollege) {
    errors.push({ field: 'implementingCollege', message: 'Implementing college is required' })
  }

  return { isValid: errors.length === 0, errors }
}

// Project validation
export function validateProject(data: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Project title is required' })
  } else if (data.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be 200 characters or less' })
  }

  if (!data.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' })
  }

  if (!data.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required' })
  }

  if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' })
  }

  return { isValid: errors.length === 0, errors }
}

// Activity validation
export function validateActivity(data: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!data.title?.trim()) {
    errors.push({ field: 'title', message: 'Activity title is required' })
  } else if (data.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be 200 characters or less' })
  }

  if (!data.startDate) {
    errors.push({ field: 'startDate', message: 'Start date is required' })
  }

  if (!data.endDate) {
    errors.push({ field: 'endDate', message: 'End date is required' })
  }

  if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
    errors.push({ field: 'endDate', message: 'End date must be after start date' })
  }

  if (data.totalCost !== undefined && data.totalCost < 0) {
    errors.push({ field: 'totalCost', message: 'Total cost cannot be negative' })
  }

  if (data.beneficiaries?.male !== undefined && data.beneficiaries.male < 0) {
    errors.push({ field: 'beneficiaries.male', message: 'Male beneficiaries cannot be negative' })
  }

  if (data.beneficiaries?.female !== undefined && data.beneficiaries.female < 0) {
    errors.push({ field: 'beneficiaries.female', message: 'Female beneficiaries cannot be negative' })
  }

  return { isValid: errors.length === 0, errors }
}

export function getErrorMessage(field: string, errors: ValidationError[]): string | undefined {
  return errors.find(e => e.field === field)?.message
}
