# Development Guide

This guide provides comprehensive instructions for setting up your development environment and working with the AlgoBrainDoctor codebase.

---

## 📋 Prerequisites

### Required Software

1. **Node.js** (version 20 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **npm** (comes with Node.js) or **pnpm** (optional, faster)
   - Verify npm: `npm --version`
   - Install pnpm (optional): `npm install -g pnpm`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

4. **Code Editor** (recommended: VS Code)
   - [Visual Studio Code](https://code.visualstudio.com/)
   - With recommended extensions (see below)

### Recommended VS Code Extensions

- **ESLint** - Code quality and style checking
- **Prettier** - Code formatting
- **TypeScript Vue Plugin (Volar)** - TypeScript support
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **Error Lens** - Inline error highlighting
- **GitLens** - Enhanced Git integration

---

## 🚀 Initial Setup

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/SMSDAO/algobraindoctor.git

# OR clone via SSH
git clone git@github.com:SMSDAO/algobraindoctor.git

# Navigate to project directory
cd algobraindoctor
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# OR using pnpm (faster)
pnpm install
```

This will install all dependencies specified in `package.json`, including:
- React 19 and React DOM
- TypeScript
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components
- Recharts (for data visualization)
- And many more...

### 3. Start Development Server

```bash
npm run dev
```

The application will start on **http://localhost:5173**

You should see:
```
VITE v7.2.6  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### 4. Load Sample Data

1. Open http://localhost:5173 in your browser
2. Click "Load Sample Data" button in the Fleet Navigator
3. Wait for toast notification confirming data load
4. Explore the interface with populated data

---

## 📁 Project Structure

```
algobraindoctor/
├── .github/              # GitHub workflows and configs
├── docs/                 # Documentation files
│   ├── INDEX.md         # Documentation index
│   ├── ARCHITECTURE.md  # Technical architecture
│   ├── FEATURES.md      # Feature documentation
│   ├── USER_GUIDE.md    # User documentation
│   ├── CONTRIBUTING.md  # Contribution guidelines
│   ├── DEVELOPMENT.md   # This file
│   └── ...
├── src/                 # Source code
│   ├── components/      # React components
│   │   ├── ui/         # UI primitives (shadcn/ui)
│   │   ├── VitalsModal.tsx
│   │   ├── HealthTimeline.tsx
│   │   ├── FleetHealthCharts.tsx
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   │   └── use-mobile.ts
│   ├── lib/            # Utilities and types
│   │   ├── types.ts    # TypeScript type definitions
│   │   ├── utils.ts    # Helper functions
│   │   └── seedData.ts # Mock data generation
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles
├── public/             # Static assets (if any)
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── components.json     # shadcn/ui configuration
└── README.md           # Project overview
```

---

## 🛠️ Development Workflow

### Daily Development

1. **Pull latest changes**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start dev server**:
   ```bash
   npm run dev
   ```

4. **Make changes** and see them live-reload

5. **Test your changes** thoroughly

6. **Commit and push** (see Git Workflow below)

### Hot Module Replacement (HMR)

Vite provides instant feedback:
- **Save a file** → Changes appear immediately
- **No full page reload** for most changes
- **State preservation** during updates

### Development Server Commands

While the dev server is running, press:
- **`h`** - Show help menu
- **`r`** - Restart server
- **`o`** - Open in browser
- **`q`** - Quit server
- **`c`** - Clear console

---

## 🧪 Testing & Quality

### Linting

Check code quality with ESLint:

```bash
# Check for issues
npm run lint

# Some issues can be auto-fixed
npm run lint -- --fix
```

**Common Lint Errors:**
- Unused variables/imports
- Missing types
- Console statements
- Spacing/formatting issues

### Type Checking

TypeScript type checking:

```bash
# Run type checker
npx tsc --noEmit
```

**Common Type Errors:**
- Missing type annotations
- Type mismatches
- Property access on potentially undefined values
- Missing return types

### Building

Test production build:

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

**Build Success Indicators:**
- No TypeScript errors
- No missing dependencies
- Optimized bundle sizes
- All assets properly bundled

---

## 🎨 Working with Components

### Creating a New Component

1. **Create component file**:
   ```bash
   touch src/components/MyComponent.tsx
   ```

2. **Component template**:
   ```typescript
   import { useState } from 'react'
   
   interface MyComponentProps {
     title: string
     onAction?: () => void
   }
   
   export function MyComponent({ title, onAction }: MyComponentProps) {
     const [state, setState] = useState(false)
     
     return (
       <div className="rounded-lg border border-violet-500/30 p-4">
         <h3 className="text-lg font-semibold">{title}</h3>
         {/* Component content */}
       </div>
     )
   }
   ```

3. **Import and use**:
   ```typescript
   import { MyComponent } from '@/components/MyComponent'
   
   <MyComponent title="Test" />
   ```

### Using shadcn/ui Components

shadcn/ui components are in `src/components/ui/`:

```typescript
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

<Button variant="default" size="lg">
  Click Me
</Button>
```

### Styling with Tailwind

Use Tailwind utility classes:

```tsx
<div className="
  flex items-center justify-between
  rounded-lg border border-violet-500/30
  bg-gray-900/50 p-6
  shadow-lg shadow-violet-500/20
  hover:border-violet-500/50
  transition-all duration-200
">
  {/* Content */}
</div>
```

**Key Tailwind Patterns:**
- **Layout**: `flex`, `grid`, `space-x-4`
- **Colors**: `bg-gray-900`, `text-violet-400`, `border-aqua-500`
- **Effects**: `shadow-lg`, `hover:`, `transition-all`
- **Responsive**: `md:flex-row`, `lg:grid-cols-3`

---

## 🔌 Working with State

### Local State (useState)

For component-level state:

```typescript
const [isOpen, setIsOpen] = useState(false)
const [count, setCount] = useState(0)
```

### Persistent State (useKV)

For state that persists across reloads:

```typescript
import { useKV } from '@github/spark'

const [repos, setRepos] = useKV<Repository[]>('repositories', [])

// Always use functional updates with useKV
setRepos((current) => [...current, newRepo])
```

**Important**: Never mutate state directly. Always create new objects/arrays.

### Derived State (useMemo)

For expensive computations:

```typescript
const filteredRepos = useMemo(() => {
  return repos.filter(repo => 
    repo.name.toLowerCase().includes(search.toLowerCase())
  )
}, [repos, search])
```

---

## 🎯 Working with Types

### Defining Types

Types are in `src/lib/types.ts`:

```typescript
// Interface for objects
interface Repository {
  id: string
  owner: string
  name: string
  healthScore: number
}

// Type for unions
type EventType = 'scan' | 'governance' | 'healing'

// Type for component props
interface VitalsModalProps {
  repo: Repository
  isOpen: boolean
  onClose: () => void
}
```

### Using Types

```typescript
// Component props
export function MyComponent({ repo }: { repo: Repository }) {
  // ...
}

// State
const [repos, setRepos] = useState<Repository[]>([])

// Function return types
function calculateScore(repo: Repository): number {
  return repo.healthScore
}
```

---

## 🐛 Debugging

### Browser DevTools

**Chrome/Edge DevTools:**
- **`F12`** - Open DevTools
- **Console** - View logs and errors
- **Elements** - Inspect DOM
- **Sources** - Set breakpoints
- **Network** - Monitor requests

**React DevTools:**
- Install [React DevTools](https://react.dev/learn/react-developer-tools)
- Inspect component tree
- View props and state
- Profile performance

### Console Logging

```typescript
// Basic logging
console.log('Value:', value)

// Grouped logs
console.group('Component Mount')
console.log('Props:', props)
console.log('State:', state)
console.groupEnd()

// Warnings and errors
console.warn('This is deprecated')
console.error('Something went wrong')

// Table view for arrays/objects
console.table(repos)
```

### TypeScript Compiler

Check types in real-time:

```bash
# Watch mode
npx tsc --watch --noEmit
```

---

## 📦 Adding Dependencies

### Adding a Package

```bash
# Production dependency
npm install package-name

# Development dependency
npm install --save-dev package-name
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages (be careful!)
npm update
```

### Removing Dependencies

```bash
npm uninstall package-name
```

---

## 🔀 Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/update-name` - Documentation
- `refactor/component-name` - Code refactoring

### Commit Messages

Follow Conventional Commits:

```bash
# Feature
git commit -m "feat(timeline): add severity filtering"

# Bug fix
git commit -m "fix(charts): resolve data calculation error"

# Documentation
git commit -m "docs(readme): update setup instructions"
```

### Pull Request Flow

1. **Create branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. **Push to GitHub**:
   ```bash
   git push origin feature/my-feature
   ```

4. **Create Pull Request** on GitHub

5. **Wait for review and merge**

---

## 🚨 Common Issues & Solutions

### Port Already in Use

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Find process using port
lsof -ti:5173

# Kill the process
kill -9 $(lsof -ti:5173)

# Or use the npm script
npm run kill
```

### Module Not Found

**Error**: `Cannot find module '@/components/...'`

**Solutions**:
1. Check file path and import
2. Restart dev server
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### TypeScript Errors

**Error**: Type errors in IDE but code works

**Solutions**:
1. Restart TypeScript server (VS Code: `Cmd/Ctrl + Shift + P` → "Restart TS Server")
2. Check `tsconfig.json` configuration
3. Clear TypeScript cache: `rm -rf node_modules/.cache`

### Tailwind Classes Not Working

**Solutions**:
1. Check `tailwind.config.js` includes your files
2. Restart dev server
3. Clear browser cache
4. Verify class names are correct (no typos)

### Hot Reload Not Working

**Solutions**:
1. Restart dev server
2. Hard refresh browser (`Cmd/Ctrl + Shift + R`)
3. Check for syntax errors
4. Clear Vite cache: `rm -rf node_modules/.vite`

---

## 🎓 Learning Resources

### Project Documentation

- [Architecture](ARCHITECTURE.md) - System design
- [Features](FEATURES.md) - Feature documentation
- [API Reference](API.md) - Component APIs
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

### External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 💡 Pro Tips

1. **Use React DevTools** to debug component state and props
2. **Enable TypeScript strict mode** for better type safety
3. **Use VS Code snippets** for common patterns
4. **Set up Prettier** for automatic formatting
5. **Use git hooks** (husky) to run lints before commit
6. **Profile performance** with React DevTools Profiler
7. **Keep components small** (< 300 lines)
8. **Extract reusable logic** into custom hooks
9. **Use memo wisely** - only for expensive operations
10. **Test in multiple browsers** during development

---

## 📞 Getting Help

### Issues During Development

1. **Check this guide** first
2. **Search existing GitHub issues**
3. **Ask in GitHub Discussions**
4. **Create a new issue** with details

### Code Review

1. **Open a draft PR** early for feedback
2. **Ask specific questions** in PR comments
3. **Request reviews** from maintainers

---

**Happy Developing! 🧠⚡**

---

**Version:** 4.0.0  
**Last Updated:** 2024-01-28  
**Maintained By:** AlgoBrainDoctor Core Team
