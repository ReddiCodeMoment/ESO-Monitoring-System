# ESO Monitoring System - Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+ 
- Firebase project (Free tier is fine)
- npm or yarn

### Installation Steps

#### 1. Clone and Install Dependencies
```bash
git clone https://github.com/ReddiCodeMoment/ESO-Monitoring-System.git
cd ESO-Monitoring-System
npm install
```

#### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Create a web app in your project
4. Copy your Firebase config from SDK snippet
5. Create `.env.local` in project root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 3. Enable Firestore Database
1. In Firebase Console, go to Build > Firestore Database
2. Create Database in Production mode
3. Start in locked mode (will update rules in step 4)

#### 4. Enable Authentication
1. In Firebase Console, go to Build > Authentication
2. Click "Get Started"
3. Enable Email/Password provider

#### 5. Update Firestore Security Rules
1. In Firestore Database, go to Rules tab
2. Replace with rules from [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md)
3. Click Publish

#### 6. Create Firestore Indexes (Optional but Recommended)
Run Firebase CLI:
```bash
firebase init firestore
firebase deploy --only firestore:indexes
```

### Development

#### Start Development Server
```bash
npm run dev
```
Server will start at `http://localhost:5173`

#### Build for Production
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```

### Project Structure

```
src/
├── components/
│   ├── ActivityForm.tsx       # Form for creating/editing activities
│   ├── ActivityList.tsx       # Table view of activities
│   ├── Dashboard.tsx          # Main dashboard component
│   ├── Header.tsx             # Header/navigation
│   ├── Login.tsx              # Authentication
│   └── Sidebar.tsx            # Navigation sidebar
├── services/
│   └── extensionService.ts    # Firebase CRUD operations
├── context/
│   ├── AppContext.tsx         # Global app state
│   └── AuthContext.tsx        # Authentication state
├── types/
│   └── index.ts               # TypeScript interfaces & types
├── firebase.config.ts         # Firebase initialization
├── App.tsx                    # Main app component
└── main.tsx                   # Entry point
```

## Key Files

- **Types**: [src/types/index.ts](src/types/index.ts) - All TypeScript interfaces
- **Services**: [src/services/extensionService.ts](src/services/extensionService.ts) - All Firebase operations
- **Forms**: [src/components/ActivityForm.tsx](src/components/ActivityForm.tsx) - Activity data entry
- **Lists**: [src/components/ActivityList.tsx](src/components/ActivityList.tsx) - Activity display
- **Architecture**: [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) - Full system documentation

## Features

### Extension Programs Management
- ✅ Create extension programs
- ✅ View all programs
- ✅ Edit program details
- ✅ Archive programs (soft delete)

### Activity Tracking
- ✅ Create activities with comprehensive details
- ✅ Track location, dates, and duration
- ✅ Select applicable SDGs (1-17)
- ✅ Manage partner information
- ✅ Track financial information
- ✅ Record beneficiary demographics
- ✅ Edit existing activities
- ✅ Delete activities
- ✅ Sort and filter activities

### Reporting
- ✅ View activity statistics
- ✅ Filter by program and time period
- ✅ Export data (ready to implement)
- ✅ Generate reports (ready to implement)

## Common Tasks

### Add Activity to Program
```typescript
import { createActivity } from '@/services/extensionService'

const activityId = await createActivity(programId, {
  title: "Community Health Drive",
  location: "Downtown Clinic",
  startDate: "2024-03-15",
  endDate: "2024-03-22",
  // ... other fields
})
```

### Get All Activities for Program
```typescript
import { getActivities } from '@/services/extensionService'

const activities = await getActivities(programId)
```

### Update Activity Status
```typescript
import { updateActivity } from '@/services/extensionService'

await updateActivity(programId, activityId, {
  status: 'completed'
})
```

### Get Statistics
```typescript
import { getActivityStats } from '@/services/extensionService'

const stats = await getActivityStats(programId)
console.log(`Total beneficiaries: ${stats.totalBeneficiaries.total}`)
```

## Troubleshooting

### "Firebase config is not initialized"
- Check `.env.local` file has correct Firebase credentials
- Make sure `npm run dev` picks up the environment variables
- Restart dev server after changing `.env.local`

### "Permission denied" errors in Firestore
- Check security rules are published (step 5 above)
- Verify user is authenticated before operations
- Check `createdBy` field matches current user ID

### Activities not appearing
- Check Firestore Database in Firebase Console
- Verify program ID is correct
- Check browser console for errors

### Build errors
- Run `npm install` to ensure all dependencies installed
- Check `firebase.config.ts` is importing correctly
- Verify all TypeScript types are correct

## Deployment

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
```

### Deploy Firestore Rules Only
```bash
firebase deploy --only firestore:rules
```

### Deploy Firestore Indexes Only
```bash
firebase deploy --only firestore:indexes
```

## Next Steps

1. ✅ Set up local development environment
2. ✅ Configure Firebase project
3. ✅ Test activity creation and viewing
4. [TODO] Implement activity export (CSV/Excel)
5. [TODO] Add reporting dashboard
6. [TODO] Implement batch import
7. [TODO] Add email notifications for approvals
8. [TODO] Create approval workflow

## Support

For issues or questions:
1. Check [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md)
2. Review [src/services/extensionService.ts](src/services/extensionService.ts) for API usage
3. Check browser console and Firebase console logs
4. Refer to [Firebase Documentation](https://firebase.google.com/docs)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
