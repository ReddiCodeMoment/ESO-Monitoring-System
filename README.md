# ESO Monitoring System

A React + TypeScript web application built with Vite for the ESO Monitoring System.

## Project Structure

```
src/
├── components/       # React components
├── context/         # Context API providers (AuthContext, AppContext)
├── hooks/           # Custom React hooks
├── services/        # API and external services
├── styles/          # CSS stylesheets
├── types/           # TypeScript interfaces and types
├── utils/           # Utility functions
├── App.tsx          # Main application component
└── main.tsx         # Application entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Deploy to Firebase:
```bash
firebase deploy
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase** - Backend and hosting

## 🎉 New Features (March 2026)

The system now includes 11 advanced features:

### Core Features
1. **📊 Analytics Dashboard** - Comprehensive overview with SDG coverage, budget, and beneficiary statistics
2. **🔍 Advanced Filtering** - Multi-filter search by status, college, location, SDGs, and date range
3. **📅 Gantt Chart Timeline** - Visual project and activity timeline view
4. **✅ Input Validation** - Form validation with error messages
5. **💬 Activity Comments** - Team collaboration with comments on activities

### UX Enhancements
6. **⌨️ Keyboard Shortcuts & Command Palette** - Quick navigation with Ctrl+K
7. **↩️ Undo/Redo History** - Revert changes with full history tracking
8. **📭 Empty States** - User-friendly messages when no data available
9. **💫 Loading Skeletons** - Better perceived performance during loading
10. **📖 Pagination** - Browse large datasets with page controls
11. **⚡ Firestore Caching** - Reduced database reads with smart caching

**For detailed usage instructions and code examples, see [FEATURES_GUIDE.md](./FEATURES_GUIDE.md)**

## Features to Add

You can now modify the content and add features:

1. Update components in `src/components/`
2. Add new context providers in `src/context/`
3. Create custom hooks in `src/hooks/`
4. Add API integrations in `src/services/`
5. Extend types in `src/types/`
6. Add utility functions in `src/utils/`
7. Customize styles in `src/styles/`

## License

All rights reserved.
