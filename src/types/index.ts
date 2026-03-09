export interface User {
  id: string
  email: string
  name: string
}

export interface BaseRecord {
  id: number
  timestamp: string
  lastModified: string
  archived: boolean
}
