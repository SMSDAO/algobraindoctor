# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with AlgoBrainDoctor.

---

## 🔍 General Troubleshooting Steps

Before diving into specific issues:

1. **Check browser console** (F12) for errors
2. **Clear browser cache** (Ctrl/Cmd + Shift + R)
3. **Verify dev server is running** (`npm run dev`)
4. **Check Node.js version** (`node --version` - must be 20+)
5. **Reinstall dependencies** (`rm -rf node_modules && npm install`)
6. **Review recent changes** (git diff)

---

## 🚫 Common Issues

### Issue: Application Won't Start

**Symptom**: `npm run dev` fails or throws errors

**Possible Causes & Solutions**:

#### 1. Port Already in Use

**Error**: `Port 5173 is already in use`

**Solution**:
```bash
# Find and kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use the npm script
npm run kill

# Then restart
npm run dev
```

#### 2. Node.js Version Too Old

**Error**: `error:0308010C:digital envelope routines::unsupported`

**Solution**:
```bash
# Check version
node --version

# Must be 20 or higher
# Install from: https://nodejs.org/
```

#### 3. Missing Dependencies

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or with pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### Issue: Blank/White Screen

**Symptom**: Application loads but shows empty white screen

**Diagnostic Steps**:

1. **Check browser console** for JavaScript errors
2. **Verify network requests** in Network tab
3. **Check if assets are loading** properly

**Common Causes**:

#### 1. JavaScript Error on Load

**Solution**:
- Check console for error message
- Fix the reported error
- Restart dev server

#### 2. React Rendering Error

**Solution**:
```typescript
// Check for render errors
// Look for issues in:
// - Missing required props
// - Undefined variables in JSX
// - Infinite loops in useEffect
```

#### 3. Build Configuration Issue

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

---

### Issue: Data Not Persisting

**Symptom**: Sample data loads but disappears after refresh

**Cause**: Spark KV storage issue or browser storage cleared

**Solutions**:

#### 1. Check Browser Storage

1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Check IndexedDB or Local Storage for `spark` data
4. If empty, data isn't being saved

#### 2. Verify useKV Usage

```typescript
// ✅ Correct - Functional update
setRepos((current) => [...current, newRepo])

// ❌ Wrong - May lose updates
setRepos([...repos, newRepo])
```

#### 3. Clear and Reload

```bash
# Clear browser storage
# In DevTools > Application > Clear site data

# Reload page and click "Load Sample Data"
```

---

### Issue: Components Not Updating

**Symptom**: UI doesn't reflect state changes

**Causes & Solutions**:

#### 1. State Mutation (Most Common)

**Problem**:
```typescript
// ❌ Wrong - Direct mutation
repos.push(newRepo)
setRepos(repos)
```

**Solution**:
```typescript
// ✅ Correct - New array
setRepos([...repos, newRepo])

// Or with useKV
setRepos((current) => [...current, newRepo])
```

#### 2. Missing Dependencies in useEffect

**Problem**:
```typescript
// ❌ Wrong - Missing dependency
useEffect(() => {
  fetchData(repoId)
}, []) // Missing repoId
```

**Solution**:
```typescript
// ✅ Correct - Include dependencies
useEffect(() => {
  fetchData(repoId)
}, [repoId])
```

#### 3. Stale Closure

**Problem**:
```typescript
// ❌ Wrong - Using stale state
setTimeout(() => {
  setCount(count + 1)
}, 1000)
```

**Solution**:
```typescript
// ✅ Correct - Functional update
setTimeout(() => {
  setCount((c) => c + 1)
}, 1000)
```

---

### Issue: Charts Not Displaying

**Symptom**: Chart components show empty or throw errors

**Solutions**:

#### 1. Missing or Invalid Data

**Check**:
```typescript
// Verify data structure
console.log('Chart data:', chartData)

// Ensure data is not empty
if (chartData.length === 0) {
  return <EmptyState />
}
```

#### 2. Recharts Configuration Error

**Common Issues**:
- Data key doesn't match data property
- Missing required props
- Invalid data types

**Example Fix**:
```typescript
// ✅ Correct - Data key matches
<Line dataKey="healthScore" data={data} />

// ❌ Wrong - Typo in dataKey
<Line dataKey="health_score" data={data} />
```

#### 3. Component Not Visible

**Check**:
- Parent has height: `min-h-[300px]`
- ResponsiveContainer has height
- Chart is not hidden by CSS

---

### Issue: TypeScript Errors

**Symptom**: Red squiggly lines in VS Code or build fails

**Common Errors & Solutions**:

#### 1. Type Mismatch

**Error**: `Type 'X' is not assignable to type 'Y'`

**Solution**:
```typescript
// Define proper types
interface Props {
  value: number  // Not string
}

// Or cast if necessary
const value = Number(stringValue)
```

#### 2. Property Not Found

**Error**: `Property 'xyz' does not exist on type 'ABC'`

**Solutions**:
```typescript
// Option 1: Add property to interface
interface ABC {
  xyz: string
}

// Option 2: Optional chaining
object?.xyz

// Option 3: Type assertion (use carefully)
(object as ABC).xyz
```

#### 3. Any Type Error

**Error**: `Parameter implicitly has 'any' type`

**Solution**:
```typescript
// Add explicit type
function myFunc(param: string) {
  // ...
}

// Or for complex types
function myFunc(param: Repository) {
  // ...
}
```

---

### Issue: Styling Not Applied

**Symptom**: Tailwind classes don't work or look wrong

**Solutions**:

#### 1. Class Name Typo

**Check**:
- Spelling: `flex-center` → `justify-center`
- Spacing: `bg-gray-900` not `bg- gray-900`
- Variants: `hover:` prefix, `md:` breakpoint

#### 2. Tailwind Not Configured

**Verify** `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

#### 3. CSS Specificity Issue

**Solution**:
```typescript
// Use !important sparingly
className="bg-gray-900 !bg-opacity-50"

// Or increase specificity
className="bg-gray-900/50"
```

#### 4. Class Conflicts

**Problem**:
```typescript
// Last class wins
className="text-red-500 text-blue-500" // Blue
```

**Solution**: Use `cn()` utility:
```typescript
import { cn } from '@/lib/utils'

className={cn(
  'text-red-500',
  isActive && 'text-blue-500'
)}
```

---

### Issue: Modal Not Opening

**Symptom**: Click button but modal doesn't appear

**Diagnostic**:

```typescript
// Add console logs
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleClick = () => {
    console.log('Button clicked')
    setIsOpen(true)
    console.log('isOpen set to:', true)
  }
  
  console.log('Rendering with isOpen:', isOpen)
  
  return (
    <>
      <button onClick={handleClick}>Open</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        Content
      </Modal>
    </>
  )
}
```

**Common Causes**:

1. **State not updating** - Check console logs
2. **Modal component error** - Check browser console
3. **CSS issue** - Modal hidden by `z-index` or `opacity`
4. **Event handler not attached** - Verify `onClick` prop

---

### Issue: Search/Filter Not Working

**Symptom**: Typing in search box doesn't filter results

**Debug Steps**:

```typescript
// Add logging
const [search, setSearch] = useState('')

const filteredRepos = useMemo(() => {
  console.log('Filtering with:', search)
  const result = repos.filter(repo =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  )
  console.log('Filtered results:', result.length)
  return result
}, [repos, search])
```

**Common Issues**:

1. **Missing dependency** in `useMemo`/`useEffect`
2. **Case sensitivity** - Use `.toLowerCase()`
3. **Wrong property** - Check if using `repo.name` or `repo.owner`
4. **Empty search** matches all - Add early return

---

### Issue: Performance Problems

**Symptom**: Application is slow or laggy

**Solutions**:

#### 1. Too Many Re-renders

**Diagnose**:
```typescript
// Add render counter
const renderCount = useRef(0)
useEffect(() => {
  renderCount.current++
  console.log('Render count:', renderCount.current)
})
```

**Common Causes**:
- Creating new objects/functions in render
- Missing memoization
- Inline object/array props

**Solutions**:
```typescript
// ✅ Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// ✅ Memoize components
const MyComponent = memo(({ data }) => {
  return <div>{data}</div>
})
```

#### 2. Large Data Sets

**Solutions**:
- Implement pagination
- Use virtual scrolling
- Limit rendered items
- Debounce search input

```typescript
// Limit rendered repos
const displayedRepos = repos.slice(0, 50)

// Debounce search
const debouncedSearch = useMemo(
  () => debounce((value) => setSearch(value), 300),
  []
)
```

#### 3. Heavy Chart Rendering

**Solutions**:
- Disable chart animations
- Reduce data points
- Lazy load charts

```typescript
// Disable animations
<AreaChart data={data}>
  <Area 
    animationDuration={0}
    isAnimationActive={false}
  />
</AreaChart>
```

---

### Issue: Build Errors

**Symptom**: `npm run build` fails

**Common Errors**:

#### 1. TypeScript Errors

**Error**: `TS2322: Type 'X' is not assignable to type 'Y'`

**Solution**:
- Fix type errors shown in output
- Or temporarily skip: `npm run build -- --no-check` (not recommended)

#### 2. Import Errors

**Error**: `Could not resolve "@/components/XYZ"`

**Solution**:
- Check file exists
- Verify path alias in `tsconfig.json` and `vite.config.ts`
- Check file extension (`.tsx` vs `.ts`)

#### 3. Memory Issues

**Error**: `JavaScript heap out of memory`

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## 🛠️ Developer Tools

### Browser DevTools

**Console Tab:**
- View errors and warnings
- Run JavaScript commands
- Check variable values

**Network Tab:**
- Monitor HTTP requests
- Check request/response data
- Verify asset loading

**Application Tab:**
- Inspect storage (IndexedDB, LocalStorage)
- View cookies
- Check service workers

**Performance Tab:**
- Record performance profile
- Identify bottlenecks
- Analyze render times

### React DevTools

**Components Tab:**
- Inspect component tree
- View props and state
- Trace updates
- Find component by name

**Profiler Tab:**
- Record interaction
- Identify slow components
- Analyze render counts
- Optimize performance

---

## 🔧 Advanced Debugging

### Enable Verbose Logging

```typescript
// Add to main.tsx
if (import.meta.env.DEV) {
  window.DEBUG = true
}

// Use throughout app
if (window.DEBUG) {
  console.log('Debug info:', data)
}
```

### React Error Boundaries

Already implemented in `ErrorFallback.tsx`:

```typescript
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

### Network Request Debugging

```typescript
// Log all fetch requests
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('Fetch:', args[0])
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Response:', response)
      return response
    })
}
```

---

## 📞 Getting Help

### Before Asking for Help

1. **Search existing issues** on GitHub
2. **Try solutions** in this guide
3. **Create minimal reproduction** of the issue
4. **Gather information**:
   - Node.js version
   - npm version
   - Browser and version
   - Operating system
   - Error messages (full stack trace)
   - Steps to reproduce

### Where to Get Help

1. **GitHub Issues** - Report bugs
2. **GitHub Discussions** - Ask questions
3. **Documentation** - Review guides
4. **Stack Overflow** - General React/TypeScript questions

### Creating a Good Issue Report

Include:
- **Clear title** describing the problem
- **Expected behavior** vs **actual behavior**
- **Steps to reproduce** (numbered list)
- **Code samples** (use markdown code blocks)
- **Screenshots** (if UI issue)
- **Environment details** (OS, browser, versions)
- **Error messages** (full text, not screenshots)

---

## ✅ Diagnostic Checklist

When encountering an issue:

- [ ] Checked browser console for errors
- [ ] Cleared browser cache and hard refreshed
- [ ] Verified dev server is running
- [ ] Checked Node.js version (20+)
- [ ] Reinstalled dependencies
- [ ] Reviewed recent code changes
- [ ] Searched existing GitHub issues
- [ ] Tried solutions from this guide
- [ ] Created minimal reproduction
- [ ] Gathered all relevant information

---

**Version:** 4.0.0  
**Last Updated:** 2024-01-28  
**Maintained By:** AlgoBrainDoctor Core Team
