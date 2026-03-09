# ESO Monitoring System - Database & Architecture Documentation

## Overview
This system tracks Extension Services Office (ESO) programs and their associated activities. Each extension program contains multiple activities with detailed tracking of beneficiaries, costs, partners, and SDG involvement.

## Data Structure

### Collections

#### `extensionPrograms` Collection
Stores all extension programs with basic information.

```
extensionPrograms/
├── docId (auto-generated)
│   ├── title: string
│   ├── description: string
│   ├── startYear: number
│   ├── endYear: number
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   ├── createdBy: string (user ID)
│   ├── archived: boolean
│   └── activities: subcollection
│       ├── docId (auto-generated)
│       ├── title: string
│       ├── location: string
│       ├── startDate: string (ISO 8601)
│       ├── endDate: string (ISO 8601)
│       ├── extensionAgenda: string
│       ├── duration: string
│       ├── sdgInvolved: array[string]
│       ├── implementingCollege: string
│       ├── programsInvolved: array[string]
│       ├── facultyExtensionists: array[string]
│       ├── partnerAgency: string
│       ├── typeOfPartner: string
│       ├── supportProvided: string
│       ├── totalCost: number
│       ├── sourceOfFund: string
│       ├── typeOfParticipant: array[string]
│       ├── beneficiaries: object
│       │   ├── male: number
│       │   ├── female: number
│       │   └── total: number
│       ├── status: string (draft|submitted|approved|completed)
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── createdBy: string (user ID)
```

## Firestore Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User must be authenticated
    match /extensionPrograms/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       request.resource.data.createdBy == request.auth.uid;
      allow update: if request.auth != null && 
                       resource.data.createdBy == request.auth.uid;
      allow delete: if request.auth != null && 
                       resource.data.createdBy == request.auth.uid;
    }
  }
}
```

## API Endpoints (Service Layer)

### Extension Programs

#### Create Program
```typescript
createExtensionProgram(programData: Omit<ExtensionProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
```
Returns: Program ID

#### Get All Programs
```typescript
getExtensionPrograms(): Promise<ExtensionProgram[]>
```
Returns: Array of non-archived programs

#### Get Program by ID
```typescript
getExtensionProgramById(programId: string): Promise<ExtensionProgram | null>
```

#### Update Program
```typescript
updateExtensionProgram(programId: string, programData: Partial<Omit<ExtensionProgram, 'id' | 'createdAt'>>): Promise<void>
```

#### Delete Program (Soft Delete)
```typescript
deleteExtensionProgram(programId: string): Promise<void>
```
Sets `archived: true`

### Activities

#### Create Activity
```typescript
createActivity(programId: string, activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
```
Returns: Activity ID

#### Get Activities by Program
```typescript
getActivities(programId: string): Promise<Activity[]>
```

#### Get Activity by ID
```typescript
getActivityById(programId: string, activityId: string): Promise<Activity | null>
```

#### Update Activity
```typescript
updateActivity(programId: string, activityId: string, activityData: Partial<Omit<Activity, 'id' | 'createdAt'>>): Promise<void>
```

#### Delete Activity
```typescript
deleteActivity(programId: string, activityId: string): Promise<void>
```

### Statistics

#### Get Program Statistics
```typescript
getActivityStats(programId: string): Promise<{
  totalActivities: number
  totalBeneficiaries: { male: number, female: number, total: number }
  totalCost: number
  sdgsInvolved: string[]
  statuses: Record<string, number>
}>
```

## Form Fields Reference

### Basic Information
- **Activity Title** (required): Name of the activity
- **Location** (required): Where the activity took place
- **Start Date** (required): ISO 8601 format (YYYY-MM-DD)
- **End Date** (required): ISO 8601 format (YYYY-MM-DD)
- **Duration**: Human-readable format (e.g., "8 hours", "2 days", "3 weeks")
- **Extension Agenda**: Description of the activity's agenda/content

### SDG Selection (Required)
Multi-select from 17 Sustainable Development Goals:
1. No Poverty
2. Zero Hunger
3. Good Health and Well-being
4. Quality Education
5. Gender Equality
6. Clean Water and Sanitation
7. Affordable and Clean Energy
8. Decent Work and Economic Growth
9. Industry, Innovation and Infrastructure
10. Reduced Inequalities
11. Sustainable Cities and Communities
12. Responsible Consumption and Production
13. Climate Action
14. Life Below Water
15. Life on Land
16. Peace, Justice and Strong Institutions
17. Partnerships for the Goals

### Organization & Implementation
- **Implementing College**: Name of college/department
- **Programs Involved**: Semi-colon separated list of programs
- **Faculty Extensionist(s)**: Semi-colon separated list of faculty names
- **Source of Fund**: Select from predefined list

### Partnership Details
- **Partner Agency**: Name of partner organization
- **Type of Partner**: Select from predefined categories:
  - Government Agency
  - Private Business
  - Non-Governmental Organization
  - Community Organization
  - Educational Institution
  - Healthcare Institution
  - International Organization
  - Other

- **Support Provided**: Description of partner support

### Financial Information
- **Total Cost**: Numeric value (can include decimals)

### Participants & Beneficiaries
- **Type of Participant**: Multi-select from:
  - Students
  - Faculty Members
  - Staff
  - Community Members
  - Government Officials
  - Business Partners
  - Other

- **Beneficiaries**:
  - Male: Number
  - Female: Number
  - Total: Number (required)

## Environment Setup

### 1. Create `.env.local` file
Copy from `.env.example` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these from: Firebase Console > Project Settings > Your apps > Web app > SDK snippet

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Component Usage

### ActivityForm Component
```tsx
import { ActivityForm } from '@/components/ActivityForm'

<ActivityForm
  programId="program-123"
  initialData={activityToEdit}
  onSubmit={async (data) => {
    await createOrUpdateActivity(data)
  }}
  onCancel={() => setShowForm(false)}
/>
```

### ActivityList Component
```tsx
import { ActivityList } from '@/components/ActivityList'

<ActivityList
  programId="program-123"
  onEdit={(activity) => setSelectedActivity(activity)}
  onRefresh={() => loadActivities()}
/>
```

## Database Indexes

For optimal query performance, set up these Firestore indexes:

### Index 1: Programs Collection
```
Collection: extensionPrograms
Fields: archived (Ascending), createdAt (Descending)
```

### Index 2: Activities Collection
```
Collection: extensionPrograms/*/activities
Fields: status (Ascending), startDate (Descending)
```

## Typical Workflows

### Creating a New Activity
1. User navigates to ActivityForm component
2. Form validates all required fields
3. On submit, calls `extensionService.createActivity()`
4. Activity is added to Firestore
5. ActivityList is refreshed with updated data

### Editing an Activity
1. User clicks Edit on ActivityList
2. ActivityForm loads with `initialData`
3. User modifies fields
4. On submit, calls `extensionService.updateActivity()`
5. ActivityList reflects changes

### Viewing Statistics
1. Call `extensionService.getActivityStats(programId)`
2. Returns aggregated data from all activities in program
3. Display in dashboard or reports

## Notes
- All dates are stored in ISO 8601 format (YYYY-MM-DD) in strings for consistency
- Timestamps use Firestore Timestamp type for precise timestamps
- Soft delete pattern used for programs (archived flag)
- Hard delete pattern used for activities
- User authentication required for all operations
