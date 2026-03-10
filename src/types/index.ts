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

// ===== ESO MONITORING SYSTEM TYPES =====

export interface Beneficiaries {
  male: number
  female: number
  total: number
}

export interface Activity {
  id: string
  title: string
  location: string
  startDate: string // ISO format YYYY-MM-DD
  endDate: string // ISO format YYYY-MM-DD
  extensionAgenda: string
  duration: string // e.g., "8 hours", "2 days", "3 months"
  
  // SDG selection
  sdgInvolved: string[] // Array of SDG numbers (1-17)
  
  // Organization details
  implementingCollege: string
  programsInvolved: string[] // Multiple programs
  facultyExtensionists: string[] // Array of faculty names
  
  // Partnership
  partnerAgency: string
  typeOfPartner: string // e.g., "Government", "Private", "NGO", "Community Organization"
  supportProvided: string
  
  // Financials
  totalCost: number
  sourceOfFund: string // e.g., "Internal", "External Grant", "Budget Allocation"
  
  // Participants
  typeOfParticipant: string[] // e.g., ["Students", "Faculty", "Community"]
  beneficiaries: Beneficiaries
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  status: 'draft' | 'submitted' | 'approved' | 'completed'
}

export interface Project {
  id: string
  title: string
  description?: string
  startDate: string // ISO format YYYY-MM-DD
  endDate: string // ISO format YYYY-MM-DD
  activities: Activity[]
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  archived: boolean
}

export interface ExtensionProgram {
  id: string
  title: string
  description?: string
  startDate: string // ISO format YYYY-MM-DD
  endDate: string // ISO format YYYY-MM-DD
  projects: Project[]
  
  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
  archived: boolean
}

export interface ActivityFormData {
  title: string
  location: string
  startDate: string
  endDate: string
  extensionAgenda: string
  duration: string
  sdgInvolved: string[]
  implementingCollege: string
  programsInvolved: string[]
  facultyExtensionists: string[]
  partnerAgency: string
  typeOfPartner: string
  supportProvided: string
  totalCost: string
  sourceOfFund: string
  typeOfParticipant: string[]
  beneficiaries: {
    male: string
    female: string
    total: string
  }
}

// SDG Constants
export const SDG_LIST = [
  { id: '1', name: 'No Poverty', color: '#E5243B' },
  { id: '2', name: 'Zero Hunger', color: '#DCC40B' },
  { id: '3', name: 'Good Health and Well-being', color: '#4C9F38' },
  { id: '4', name: 'Quality Education', color: '#C6192B' },
  { id: '5', name: 'Gender Equality', color: '#E5003B' },
  { id: '6', name: 'Clean Water and Sanitation', color: '#26BDE2' },
  { id: '7', name: 'Affordable and Clean Energy', color: '#FCCC0A' },
  { id: '8', name: 'Decent Work and Economic Growth', color: '#A21942' },
  { id: '9', name: 'Industry, Innovation and Infrastructure', color: '#DD1C3B' },
  { id: '10', name: 'Reduced Inequalities', color: '#DD1C3B' },
  { id: '11', name: 'Sustainable Cities and Communities', color: '#FD6925' },
  { id: '12', name: 'Responsible Consumption and Production', color: '#BF8B2E' },
  { id: '13', name: 'Climate Action', color: '#407D52' },
  { id: '14', name: 'Life Below Water', color: '#0A97D9' },
  { id: '15', name: 'Life on Land', color: '#56C596' },
  { id: '16', name: 'Peace, Justice and Strong Institutions', color: '#00689D' },
  { id: '17', name: 'Partnerships for the Goals', color: '#667D8D' },
]

export const PARTNER_TYPES = [
  'Government Agency',
  'Private Business',
  'Non-Governmental Organization',
  'Community Organization',
  'Educational Institution',
  'Healthcare Institution',
  'International Organization',
  'Other',
]

export const PARTICIPANT_TYPES = [
  'Students',
  'Faculty Members',
  'Staff',
  'Community Members',
  'Government Officials',
  'Business Partners',
  'Other',
]

export const FUND_SOURCES = [
  'University Internal Budget',
  'External Grant',
  'Government Allocation',
  'Private Sponsorship',
  'Partner Organization',
  'Other',
]

export const EXTENSION_AGENDAS = [
  'Adopt A Municipality/ Adopt A Community/ Social Development thru BIDANI Implementation',
  'BatStateU Inclusive Social Innovation for Regional Growth (BISIG) Program',
  'Community Outreach Program',
  'Disaster Risk Reduction and Management and Disaster Preparedness and Response to Climate Change',
  'Environment and Natural Resources Conservation, Protection and Rehabilitation Program',
  'Gender and Development',
  'Livelihood and other Entrepreneurship related on Agri-Fisheries (LEAF)',
  'Parent\'s Empowerment Through Social Development (PESODEV)',
  'Smart Analytics and Engineering Innovation',
  'Technical Assistance and Advisory Services Program',
  'Technical-Vocational Training (TVET) Program on Skills and Agri-Fishery and Related Program for farmers and Fisherfolks',
  'Technology Transfer and Adoption Utilization Program',
]

export const IMPLEMENTING_COLLEGES = [
  'CTE',
  'COM',
  'CHS',
  'CCJE',
  'CAS',
  'CABEHIM',
]
