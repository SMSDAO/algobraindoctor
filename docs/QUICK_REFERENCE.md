# Quick Reference Guide

> **Essential commands, patterns, and tips for working with AlgoBrainDoctor**

This is a condensed reference for common tasks and patterns. For detailed information, see the [full documentation](INDEX.md).

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/SMSDAO/algobraindoctor.git
cd algobraindoctor

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

---

## 📦 Common Commands

### Development
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run kill         # Kill process on port 5000
```

### Git Workflow
```bash
git checkout -b feature/my-feature    # Create feature branch
git add .                             # Stage changes
git commit -m "feat: description"     # Commit with message
git push origin feature/my-feature    # Push to GitHub
```

---

## 🎯 Code Patterns

### Component Template
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
      {/* Content */}
    </div>
  )
}
```

### State Management with useKV
```typescript
import { useKV } from '@github/spark'

// Persistent state
const [repos, setRepos] = useKV<Repository[]>('repositories', [])

// Always use functional updates
setRepos((current) => [...current, newRepo])          // ✅ Correct
setRepos([...repos, newRepo])                         // ❌ Wrong (stale)
```

### Memoization
```typescript
import { useMemo, useCallback } from 'react'

// Memoize expensive computations
const filteredData = useMemo(() => {
  return data.filter(item => item.score > 50)
}, [data])

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

---

## 🎨 Styling Patterns

### Common Tailwind Classes
```typescript
// Card
"rounded-lg border border-violet-500/30 bg-gray-900/50 p-6 shadow-lg"

// Button
"rounded-md bg-violet-500 px-4 py-2 text-white hover:bg-violet-600"

// Glow effect
"shadow-lg shadow-violet-500/20"

// Responsive
"flex flex-col md:flex-row lg:grid-cols-3"
```

### Color Palette
```typescript
// Primary colors
violet-500    // #A78BFA - Primary actions
aqua-500      // #4FD1C5 - Success states
coral-500     // #F87171 - Errors
yellow-500    // #FACC15 - Warnings
```

---

## 📁 File Structure

```
src/
├── components/           # React components
│   ├── ui/              # UI primitives
│   └── *.tsx            # Feature components
├── hooks/               # Custom hooks
├── lib/                 # Utilities
│   ├── types.ts        # TypeScript types
│   ├── utils.ts        # Helper functions
│   └── seedData.ts     # Mock data
├── App.tsx             # Main app
└── main.tsx            # Entry point
```

---

## 🔧 Type Definitions

### Core Types
```typescript
// Repository
interface Repository {
  id: string
  owner: string
  name: string
  healthScore: number      // 0-100
  activityScore: number
  governanceScore: number
}

// Worker
type WorkerType = 'index' | 'identity' | 'score' | /* ... */
type WorkerStatus = 'healthy' | 'degraded' | 'failed'

interface Worker {
  id: string
  type: WorkerType
  status: WorkerStatus
  jobsCompleted: number
}

// Timeline Event
interface TimelineEvent {
  id: string
  repoId: string
  type: 'scan' | 'governance' | 'healing'
  severity: 'info' | 'warning' | 'error' | 'success' | 'critical'
  timestamp: string
}
```

---

## 🐛 Debugging Tips

### Console Logging
```typescript
// Basic
console.log('Value:', value)

// Grouped
console.group('Component Mount')
console.log('Props:', props)
console.groupEnd()

// Table view
console.table(repos)
```

### React DevTools
```
F12 → Components tab
- Inspect component tree
- View props and state
- Trace updates
```

### Common Fixes
```bash
# Port in use
npm run kill

# Clear cache
rm -rf node_modules/.vite
rm -rf node_modules && npm install

# Restart TypeScript server (VS Code)
Cmd/Ctrl + Shift + P → "Restart TS Server"
```

---

## 📊 Performance Tips

```typescript
// Memoize chart data
const chartData = useMemo(() => {
  return computeExpensiveData(events)
}, [events])

// Limit rendered items
const displayedRepos = repos.slice(0, 50)

// Debounce search
const debouncedSearch = useMemo(
  () => debounce((value) => setSearch(value), 300),
  []
)

// Virtual scrolling (large lists)
import { ScrollArea } from '@/components/ui/scroll-area'
```

---

## 🔐 Security Checklist

- [ ] No hardcoded secrets or API keys
- [ ] All user input validated
- [ ] Output properly sanitized
- [ ] HTTPS enabled in production
- [ ] Dependencies up to date (`npm audit`)
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info

---

## 📝 Commit Message Format

```
<type>(<scope>): <subject>

Types:
feat     - New feature
fix      - Bug fix
docs     - Documentation
style    - Code style (no logic change)
refactor - Code refactoring
perf     - Performance improvement
test     - Tests
chore    - Other changes

Examples:
feat(timeline): add event filtering by severity
fix(charts): resolve score calculation error
docs(readme): update installation instructions
```

---

## 🎯 Common Tasks

### Add a new component
```bash
# 1. Create component file
touch src/components/MyComponent.tsx

# 2. Define props interface
# 3. Implement component
# 4. Export from component
# 5. Import and use

import { MyComponent } from '@/components/MyComponent'
```

### Add a new type
```typescript
// In src/lib/types.ts
export interface MyType {
  id: string
  name: string
}

// Use in component
import { MyType } from '@/lib/types'
```

### Add persistent state
```typescript
import { useKV } from '@github/spark'

const [data, setData] = useKV<MyType[]>('my-key', [])
```

---

## 🔗 Quick Links

| Document | Purpose |
|----------|---------|
| [INDEX](INDEX.md) | Documentation navigation |
| [USER_GUIDE](USER_GUIDE.md) | How to use the app |
| [DEVELOPMENT](DEVELOPMENT.md) | Development setup |
| [API](API.md) | Component reference |
| [TROUBLESHOOTING](TROUBLESHOOTING.md) | Common issues |
| [CONTRIBUTING](CONTRIBUTING.md) | How to contribute |

---

## 💡 Pro Tips

1. **Use React DevTools** for debugging
2. **Enable TypeScript strict mode** for safety
3. **Memoize expensive operations** with useMemo
4. **Use functional updates** with useKV
5. **Keep components small** (< 300 lines)
6. **Test in multiple browsers**
7. **Check console for errors** regularly
8. **Use the cn() utility** for class names
9. **Follow the style guide** in CONTRIBUTING.md
10. **Read the docs** - they're comprehensive!

---

## 📞 Get Help

- **Docs**: [INDEX.md](INDEX.md)
- **Issues**: [GitHub Issues](https://github.com/SMSDAO/algobraindoctor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SMSDAO/algobraindoctor/discussions)

---

**Version:** 4.0.0  
**Last Updated:** 2024-01-28

For detailed documentation, see [INDEX.md](INDEX.md)
