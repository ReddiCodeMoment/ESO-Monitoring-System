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

// Extension Agendas
export const EXTENSION_AGENDAS = [
  'Adopt A Municipality/ Adopt A Community/ Social Development thru BIDANI Implementation',
  'BatStateUI Inclusive Social Innovation for Regional Growth ( BISIG) Program',
  'Community Outreach Program',
  'Disaster Risk Reduction and Management and Disaster Preparedness and Response to Climate Change',
  'Environment and Natural Resources Conservation, Protection and Rehabilitation Program',
  'Gender and Development',
  'Livelihood and other Entrepreneurship related on Agri-Fisheries ( LEAF )',
  'Parent\'s Empowerment Through Social Development (PESODEV)',
  'Smart Analytics and Engineering Innovation',
  'Technical Assistance and Advisory Services Program',
  'Technical- Vocational Training(TVET) Program on Skills and Agri-Fishery and Related Program for farmers and Fisherfolks',
  'Technology Transfer and Adoption Utilization Program',
]

// Type of Community Service
export const TYPE_OF_COMMUNITY_SERVICE = [
  'Advocacy and communication campaign (IEC)',
  'Capability-building training',
  'Community Outreach',
  'Technical Assistance and Advisory Service',
  'Technology Transfer',
  'Others'
]

// Program Status
export const PROGRAM_STATUS = ['On Going', 'Completed']

export interface ExtensionProgram {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  color?: string
  implementingCollege: string
  extensionAgenda: string
  typeOfCommunityService: string
  status?: 'On Going' | 'Completed'
  sdgInvolved?: string[]
  typeOfBeneficiaries?: string
  budgetUtilization?: number
  sourceOfFund?: string
  beneficiaries?: {
    male?: number
    female?: number
    total?: number
    unspecified?: boolean
  }
  projects?: Project[]
  createdBy: string
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  extensionAgenda: string
  typeOfCommunityService: string
  sdgInvolved?: string[]
  activities?: Activity[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Activity {
  id: string
  title: string
  location: string
  startDate: string
  endDate: string
  extensionAgenda: string
  typeOfCommunityService: string
  duration: string
  sdgInvolved: string[]
  implementingCollege: string
  programsInvolved: string[]
  facultyExtensionists: string[]
  partnerAgency: string
  typeOfPartner: string
  supportProvided: string
  totalCost: number
  sourceOfFund: string
  typeOfParticipant: string[]
  beneficiaries: {
    male: number
    female: number
    total: number
  }
  status?: 'draft' | 'submitted' | 'approved' | 'completed'
  createdAt: string
  updatedAt: string
  createdBy: string
}

// Reusable Constants
export const IMPLEMENTING_COLLEGES = [
  'College of Agriculture',
  'College of Arts and Sciences',
  'College of Business and Accountancy',
  'College of Education',
  'College of Engineering',
  'College of Health Sciences',
  'College of Law',
  'College of Medicine',
]

export const SDG_LIST = [
  { id: '1', name: 'No Poverty', description: 'End poverty' },
  { id: '2', name: 'Zero Hunger', description: 'End hunger' },
  { id: '3', name: 'Good Health and Well-being', description: 'Health and wellness' },
  { id: '4', name: 'Quality Education', description: 'Education' },
  { id: '5', name: 'Gender Equality', description: 'Gender equality' },
  { id: '6', name: 'Clean Water and Sanitation', description: 'Water and sanitation' },
  { id: '7', name: 'Affordable and Clean Energy', description: 'Energy' },
  { id: '8', name: 'Decent Work and Economic Growth', description: 'Work and growth' },
  { id: '9', name: 'Industry, Innovation and Infrastructure', description: 'Industry and innovation' },
  { id: '10', name: 'Reduced Inequalities', description: 'Reduce inequalities' },
  { id: '11', name: 'Sustainable Cities and Communities', description: 'Sustainable cities' },
  { id: '12', name: 'Responsible Consumption and Production', description: 'Consumption' },
  { id: '13', name: 'Climate Action', description: 'Climate' },
  { id: '14', name: 'Life Below Water', description: 'Marine life' },
  { id: '15', name: 'Life on Land', description: 'Land life' },
  { id: '16', name: 'Peace, Justice and Strong Institutions', description: 'Peace' },
  { id: '17', name: 'Partnerships for the Goals', description: 'Partnerships' },
]

export const PARTNER_TYPES = [
  'Government Agency',
  'Non-Governmental Organization (NGO)',
  'Private Sector',
  'Academic Institution',
  'Community Organization',
  'International Organization',
]

export const FUND_SOURCES = [
  'Internal University Funds',
  'Government Grant',
  'Donation from Private Sector',
  'International Funding',
  'Student Fees',
]

export const PROGRAM_FUND_SOURCES = [
  'Institutional, MDS Fund',
  'Institutional, STF Fund',
  'External Fund',
  'Others',
]

export const TYPE_OF_BENEFICIARIES = [
  'BHW',
  'BNS',
  'Children',
  'Cooperatives/ Enterprise',
  'Differently-abled persons',
  'Disaster Victims',
  'Domestic workers',
  'Farmer',
  'Fisherfolk',
  'Government Agencies',
  'Industries',
  'IPs',
  'LGUs',
  'Migrant workers',
  'NGOs',
  'Persons Deprived of liberty',
  'POs/CSOs',
  'Professional workers',
  'Senior Citizens',
  'Skilled workers',
  'Women',
  'Youth/ students',
]

export interface ActivityFormData {
  title: string
  location: string
  startDate: string
  endDate: string
  extensionAgenda: string
  typeOfCommunityService: string
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
