# API Reference

This document provides a comprehensive reference for all data structures, component APIs, hooks, and utility functions in AlgoBrainDoctor.

---

## 📦 Data Structures & Types

All types are defined in `src/lib/types.ts`.

### Core Types

#### Repository

Represents a repository in the system.

```typescript
interface Repository {
  id: string                 // Unique identifier
  provider: string          // Git provider (e.g., "github", "gitlab")
  owner: string             // Repository owner username/org
  name: string              // Repository name
  defaultBranch: string     // Default branch name
  lastIndexedAt: string     // ISO 8601 timestamp of last indexing
  healthScore: number       // Health score (0-100)
  activityScore: number     // Activity score (0-100)
  governanceScore: number   // Governance score (0-100)
  claimsCount: number       // Number of identity claims
  frameworks: string[]      // Detected frameworks (e.g., ["React", "TypeScript"])
}
```

#### Worker

Represents a worker in the worker pool.

```typescript
type WorkerType =
  | 'index'          // Repository discovery
  | 'identity'       // Developer identity resolution
  | 'score'          // Health score computation
  | 'ingest'         // GitHub webhook processing
  | 'sync'           // Repository metadata sync
  | 'gc'             // Garbage collection
  | 'alert'          // Monitoring and notifications
  | 'export'         // Report generation
  | 'audit'          // Compliance logging
  | 'repair'         // Data inconsistency fixes
  | 'backfill'       // Historical data population
  | 'maintenance'    // Database optimization

type WorkerStatus = 'healthy' | 'degraded' | 'failed'

interface Worker {
  id: string              // Unique identifier
  type: WorkerType        // Worker type
  status: WorkerStatus    // Current status
  lastRun: string         // ISO 8601 timestamp of last execution
  jobsCompleted: number   // Total successful jobs
  jobsFailed: number      // Total failed jobs
  avgDuration: number     // Average job duration (ms)
  queueSize: number       // Pending jobs count
}
```

#### TimelineEvent

Represents an event in the repository timeline.

```typescript
interface TimelineEvent {
  id: string                    // Unique identifier
  repoId: string                // Associated repository ID
  type: 'scan' | 'governance' | 'healing'  // Event category
  timestamp: string             // ISO 8601 timestamp
  severity: 'info' | 'warning' | 'error' | 'success' | 'critical'  // Severity level
  title: string                 // Event title
  description: string           // Event description
  workerType?: WorkerType       // Worker that generated event (optional)
  metadata?: {                  // Additional event data
    oldScore?: number           // Previous score
    newScore?: number           // New score
    duration?: number           // Operation duration (ms)
    framework?: string          // Detected framework
    claimType?: string          // Claim type
    issueCount?: number         // Number of issues
    [key: string]: unknown      // Extensible metadata
  }
}
```

#### Identity & Claims

```typescript
type IdentityClaimType =
  | 'owner'          // Repository owner
  | 'maintainer'     // Repository maintainer
  | 'contributor'    // Code contributor
  | 'governor'       // Governance authority
  | 'other'          // Other claim type

type ClaimStatus = 'pending' | 'verified' | 'rejected' | 'revoked'

interface Identity {
  id: string              // Unique identifier
  type: string            // Identity type (e.g., "github", "email")
  handle: string          // Username or handle
  displayName: string     // Display name
  avatarUrl?: string      // Avatar URL (optional)
  verifiedAt?: string     // Verification timestamp (optional)
  createdAt: string       // Creation timestamp
}

interface IdentityClaim {
  id: string                      // Unique identifier
  identityId: string              // Associated identity ID
  repoId: string                  // Associated repository ID
  claimType: IdentityClaimType    // Type of claim
  status: ClaimStatus             // Current status
  evidence?: Record<string, unknown>  // Supporting evidence (optional)
  createdAt: string               // Creation timestamp
  verifiedAt?: string             // Verification timestamp (optional)
  revokedAt?: string              // Revocation timestamp (optional)
}
```

#### Healdec (Auto-Healing)

```typescript
type HealdecAction =
  | 'retry'              // Retry with exponential backoff
  | 'reroute'            // Redirect to alternate worker
  | 'quarantine'         // Isolate for review
  | 'repair_triggered'   // Activate repair worker
  | 'escalate'           // Alert for manual intervention

interface HealdecLogEntry {
  id: string                      // Unique identifier
  timestamp: string               // ISO 8601 timestamp
  workerType: WorkerType          // Affected worker
  action: HealdecAction           // Action taken
  reason: string                  // Reason for action
  jobId: string                   // Affected job ID
  metadata?: Record<string, unknown>  // Additional data
}
```

#### Logging

```typescript
interface LogEntry {
  id: string                    // Unique identifier
  timestamp: string             // ISO 8601 timestamp
  level: 'info' | 'warn' | 'error'  // Log level
  workerType?: WorkerType       // Worker that generated log (optional)
  message: string               // Log message
  context?: Record<string, unknown>  // Additional context
}
```

---

## 🧩 Component APIs

### VitalsModal

Displays detailed health metrics for a repository.

**Props:**
```typescript
interface VitalsModalProps {
  repo: Repository           // Repository to display
  isOpen: boolean            // Modal open state
  onClose: () => void        // Close handler
  events: TimelineEvent[]    // Timeline events for the repo
}
```

**Usage:**
```tsx
<VitalsModal
  repo={selectedRepo}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  events={timelineEvents}
/>
```

**Features:**
- Three tabs: Overview, Trends, Timeline
- Real-time health score display
- Historical trend charts
- Comprehensive event timeline

### HealthTimeline

Displays chronological event timeline with filtering.

**Props:**
```typescript
interface HealthTimelineProps {
  events: TimelineEvent[]       // Events to display
  repoId: string                // Repository ID for filtering
}
```

**Usage:**
```tsx
<HealthTimeline
  events={allEvents}
  repoId={repo.id}
/>
```

**Features:**
- Filter by event type and severity
- Expandable event details
- Export to JSON
- Statistics summary

### HealthTrendCharts

Visualizes repository health trends over time.

**Props:**
```typescript
interface HealthTrendChartsProps {
  events: TimelineEvent[]    // Timeline events
  repo: Repository           // Repository data
}
```

**Usage:**
```tsx
<HealthTrendCharts
  events={filteredEvents}
  repo={repository}
/>
```

**Charts:**
- Score History (area chart)
- Activity Timeline (bar chart)
- Severity Distribution (pie chart)
- Statistics cards

### FleetHealthCharts

Fleet-wide health analytics.

**Props:**
```typescript
interface FleetHealthChartsProps {
  repositories: Repository[]    // All repositories
  workers: Worker[]             // All workers
}
```

**Usage:**
```tsx
<FleetHealthCharts
  repositories={allRepos}
  workers={workerPool}
/>
```

**Visualizations:**
- Fleet average scores (radial chart)
- Health distribution
- Top/bottom performers
- Worker pool status

### WorkerCard

Displays status and metrics for a single worker.

**Props:**
```typescript
interface WorkerCardProps {
  worker: Worker              // Worker data
  onClick?: () => void        // Click handler (optional)
}
```

**Usage:**
```tsx
<WorkerCard
  worker={indexWorker}
  onClick={() => handleWorkerClick(worker.id)}
/>
```

**Display:**
- Status badge with glow effect
- Job statistics
- Average duration
- Queue size

### RepoCard

Repository card with health indicators.

**Props:**
```typescript
interface RepoCardProps {
  repo: Repository            // Repository data
  onClick: () => void         // Click handler
}
```

**Usage:**
```tsx
<RepoCard
  repo={repository}
  onClick={() => setSelectedRepo(repo)}
/>
```

**Display:**
- Repository name and owner
- Health score with color coding
- Last indexed timestamp
- Framework badges

### SmartBrainTerminal

Live system log viewer.

**Props:**
```typescript
interface SmartBrainTerminalProps {
  logs: LogEntry[]            // Log entries to display
  maxLogs?: number            // Maximum logs to keep (default: 100)
}
```

**Usage:**
```tsx
<SmartBrainTerminal
  logs={systemLogs}
  maxLogs={200}
/>
```

**Features:**
- Auto-scrolling
- Color-coded by log level
- Monospace font
- Expandable context

### HealdecModal

Displays auto-healing activity log.

**Props:**
```typescript
interface HealdecModalProps {
  isOpen: boolean                    // Modal open state
  onClose: () => void                // Close handler
  healdecLogs: HealdecLogEntry[]     // Healing log entries
}
```

**Usage:**
```tsx
<HealdecModal
  isOpen={isHealdecOpen}
  onClose={() => setIsHealdecOpen(false)}
  healdecLogs={healingLogs}
/>
```

### ClaimModal

Identity claim submission form.

**Props:**
```typescript
interface ClaimModalProps {
  isOpen: boolean            // Modal open state
  onClose: () => void        // Close handler
  onSubmit: (claim: Partial<IdentityClaim>) => void  // Submit handler
}
```

**Usage:**
```tsx
<ClaimModal
  isOpen={isClaimOpen}
  onClose={() => setIsClaimOpen(false)}
  onSubmit={handleClaimSubmit}
/>
```

---

## 🪝 Custom Hooks

### useMobile

Detects if the current viewport is mobile-sized.

**Signature:**
```typescript
function useMobile(): boolean
```

**Usage:**
```typescript
import { useMobile } from '@/hooks/use-mobile'

function MyComponent() {
  const isMobile = useMobile()
  
  return (
    <div className={isMobile ? 'flex-col' : 'flex-row'}>
      {/* Content */}
    </div>
  )
}
```

**Breakpoint:** Returns `true` if viewport width < 768px

### useKV (from @github/spark)

Persistent key-value storage hook.

**Signature:**
```typescript
function useKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void]
```

**Usage:**
```typescript
import { useKV } from '@github/spark'

function MyComponent() {
  const [repos, setRepos] = useKV<Repository[]>('repositories', [])
  
  // Always use functional updates to avoid stale closures
  const addRepo = (newRepo: Repository) => {
    setRepos((current) => [...current, newRepo])
  }
  
  return <div>{repos.length} repositories</div>
}
```

**Important:** Always use functional updates with `useKV` to ensure you're working with the latest state.

---

## 🛠️ Utility Functions

All utility functions are in `src/lib/utils.ts`.

### cn (className utility)

Merges and deduplicates Tailwind CSS class names.

**Signature:**
```typescript
function cn(...inputs: ClassValue[]): string
```

**Usage:**
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDark ? 'dark-mode' : 'light-mode'
)}>
  Content
</div>
```

**Powered by:** `clsx` and `tailwind-merge`

### formatTimestamp

Formats ISO 8601 timestamp to relative time.

**Signature:**
```typescript
function formatTimestamp(timestamp: string): string
```

**Usage:**
```typescript
import { formatTimestamp } from '@/lib/utils'

const relativeTime = formatTimestamp(event.timestamp)
// Returns: "2h ago", "5m ago", "yesterday", etc.
```

### generateId

Generates a unique identifier.

**Signature:**
```typescript
function generateId(): string
```

**Usage:**
```typescript
import { generateId } from '@/lib/utils'

const newEvent: TimelineEvent = {
  id: generateId(),
  // ... other properties
}
```

---

## 📊 Data Generation (seedData.ts)

Functions for generating mock data for development and testing.

### generateSampleRepositories

Generates mock repository data.

**Signature:**
```typescript
function generateSampleRepositories(count?: number): Repository[]
```

**Usage:**
```typescript
import { generateSampleRepositories } from '@/lib/seedData'

const repos = generateSampleRepositories(10) // 10 sample repos
```

### generateSampleWorkers

Generates mock worker pool.

**Signature:**
```typescript
function generateSampleWorkers(): Worker[]
```

**Usage:**
```typescript
import { generateSampleWorkers } from '@/lib/seedData'

const workers = generateSampleWorkers() // 12 workers
```

### generateTimelineEvents

Generates mock timeline events for a repository.

**Signature:**
```typescript
function generateTimelineEvents(
  repoId: string,
  count?: number
): TimelineEvent[]
```

**Usage:**
```typescript
import { generateTimelineEvents } from '@/lib/seedData'

const events = generateTimelineEvents(repo.id, 50) // 50 events
```

### generateHealdecLogs

Generates mock auto-healing logs.

**Signature:**
```typescript
function generateHealdecLogs(count?: number): HealdecLogEntry[]
```

**Usage:**
```typescript
import { generateHealdecLogs } from '@/lib/seedData'

const logs = generateHealdecLogs(20) // 20 healing logs
```

---

## 🎨 UI Component Variants

### Badge Variants

From `src/components/ui/badge.tsx`:

```typescript
// Default badge
<Badge>Status</Badge>

// Variant badges
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Button Variants

From `src/components/ui/button.tsx`:

```typescript
// Size variants
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// Style variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

---

## 🔌 State Persistence Keys

Keys used with `useKV` for state persistence:

```typescript
// Repository data
'repositories'              // Repository[]

// Worker pool
'workers'                   // Worker[]

// Timeline events
'timeline-events'           // TimelineEvent[]

// System logs
'logs'                      // LogEntry[]

// Healdec logs
'healdec-logs'              // HealdecLogEntry[]

// Identity claims
'identity-claims'           // IdentityClaim[]

// Identities
'identities'                // Identity[]
```

**Usage Pattern:**
```typescript
const [repos, setRepos] = useKV<Repository[]>('repositories', [])
const [workers, setWorkers] = useKV<Worker[]>('workers', [])
```

---

## 📝 Type Guards & Validators

### Type Guards

```typescript
// Check if event is a specific type
function isScanEvent(event: TimelineEvent): event is ScanEvent {
  return event.type === 'scan'
}

// Check if worker is healthy
function isHealthyWorker(worker: Worker): boolean {
  return worker.status === 'healthy'
}

// Check if score is in range
function isValidScore(score: number): boolean {
  return score >= 0 && score <= 100
}
```

---

## 🔄 Data Flow Patterns

### Loading Data Pattern

```typescript
function MyComponent() {
  const [data, setData] = useKV<DataType[]>('key', [])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Simulate data load
    const loadData = async () => {
      setLoading(true)
      try {
        const newData = await fetchData()
        setData(newData)
      } catch (error) {
        console.error('Load failed:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  if (loading) return <div>Loading...</div>
  return <div>Data loaded</div>
}
```

### Updating Data Pattern

```typescript
// Add item
setData((current) => [...current, newItem])

// Update item
setData((current) =>
  current.map((item) =>
    item.id === targetId ? { ...item, ...updates } : item
  )
)

// Remove item
setData((current) =>
  current.filter((item) => item.id !== targetId)
)

// Replace all
setData(newDataArray)
```

---

## 🎯 Best Practices

### Type Safety

```typescript
// ✅ Good - Explicit types
const repos: Repository[] = []
function processRepo(repo: Repository): void { }

// ❌ Bad - Implicit any
const repos = []
function processRepo(repo) { }
```

### Component Props

```typescript
// ✅ Good - Interface for props
interface MyComponentProps {
  title: string
  count: number
  onAction?: () => void
}

// ❌ Bad - Inline props
function MyComponent(props: { title: string; count: number }) { }
```

### State Updates

```typescript
// ✅ Good - Functional update with useKV
setRepos((current) => [...current, newRepo])

// ❌ Bad - Direct reference
setRepos([...repos, newRepo])  // May use stale state
```

---

**Version:** 4.0.0  
**Last Updated:** 2024-01-28  
**Maintained By:** AlgoBrainDoctor Core Team
