# AlgoBrainDoctor v0.1 — Architecture Documentation

## 1. Purpose & Scope

AlgoBrainDoctor v0.1 implements a **social index and identity claim network** that:

- **Indexes** repositories, contributors, and governance signals across fleets
- **Tracks** identity claims (handles, keys, addresses, GitHub identities)
- **Scores** trust, activity, and governance health
- **Visualizes** health trends and timeline events in real-time
- **Exposes** a full-stack interface (React UI) for querying and managing claims
- **Simulates** a **12 parallel workers** system with **Healdec auto-healing**

This document is the **canonical architecture spec** for the implementation, deployment, and evolution of this system.

---

## 2. High-Level System Architecture

**Core components:**

- **React Frontend Application**
  - Production-ready single-page application
  - Role-based adaptive interface
  - Real-time health monitoring dashboard

- **Data Persistence Layer**
  - Spark KV (key-value) storage for state persistence
  - Reactive state management with `useKV` hooks
  - JSON-based data structures

- **Simulated Worker Pool (12 parallel workers)**
  - Each worker represented in the UI with real-time status
  - Worker types: Index, Identity, Score, Ingest, Sync, GC, Alert, Export, Audit, Repair, Backfill, Maintenance

- **Healdec Auto-Healing Simulation**
  - Visual representation of auto-healing actions
  - Recovery strategy logging and visualization

---

## 3. Frontend Architecture

### 3.1 Component Hierarchy

```
App (Root)
├── Header (Navigation & Role Selector)
├── Fleet Navigator (Left Sidebar)
│   ├── Search Input
│   ├── Repository List
│   │   └── RepoCard (with HealthSparkline)
│   └── Claim Submission Button
├── Main Content Area (Center)
│   └── Tabs
│       ├── Analytics Tab
│       │   └── FleetHealthCharts
│       ├── Workers Tab
│       │   └── WorkerCard (×12)
│       ├── Healing Tab
│       │   └── Healdec Log Preview
│       └── Claims Tab
├── Live System Log (Right Sidebar)
│   └── SmartBrainTerminal
└── Modals
    ├── VitalsModal
    │   ├── Overview Tab
    │   │   ├── Metrics Cards
    │   │   └── Repository Details
    │   ├── Trends Tab
    │   │   └── HealthTrendCharts
    │   └── Timeline Tab
    │       └── HealthTimeline
    ├── HealdecModal
    ├── ClaimModal
    └── (Future modals)
```

### 3.2 Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    User Actions                      │
│  (Load Data, Select Repo, Filter Events, Export)    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│               React Component State                  │
│  (useState, useKV for persistence)                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Spark KV Storage Layer                  │
│  (repositories, workers, logs, healdec-logs, etc.)   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│            UI Component Rendering                    │
│  (Cards, Charts, Timeline, Badges, Modals)           │
└─────────────────────────────────────────────────────┘
```

---

## 4. Core Features Implementation

### 4.1 Repository Health Timeline

**Component:** `HealthTimeline.tsx`

**Purpose:** Comprehensive event timeline showing all repository scans, governance events, and healing actions.

**Key Features:**
- **Event Filtering**: Filter by type (scan/governance/healing) and severity (success/info/warning/error/critical)
- **Event Statistics**: Live count of events by type and severity
- **Expandable Details**: Click events to view full metadata
- **Visual Indicators**: Color-coded icons and glow effects based on severity
- **Relative Timestamps**: Human-readable "2h ago" with full datetime on expand
- **Export Functionality**: Export filtered events to JSON
- **Connection Lines**: Visual timeline connectors between events

**Implementation Highlights:**
```typescript
// Event structure
interface TimelineEvent {
  id: string
  repoId: string
  type: 'scan' | 'governance' | 'healing'
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'success' | 'critical'
  title: string
  description: string
  workerType?: WorkerType
  metadata?: Record<string, unknown>
}

// Filtering logic
const filteredEvents = events
  .filter((event) => filter === 'all' || event.type === filter)
  .filter((event) => severityFilter === 'all' || event.severity === severityFilter)
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
```

**Visual Design:**
- Aqua glow for success events
- Yellow glow for warnings
- Coral glow for errors
- Violet glow for info events
- Animated border expansion on hover
- Sticky header with filters

### 4.2 Health Trend Charts

**Component:** `HealthTrendCharts.tsx`

**Purpose:** Visualize repository health trends over time with multiple chart types.

**Chart Types:**

1. **Score History (Area Chart)**
   - 30-day historical view of health and governance scores
   - Dual-axis with gradient fills
   - Color-coded: Aqua (health), Violet (governance)
   - Smooth monotone curves

2. **Activity Timeline (Stacked Bar Chart)**
   - Daily event counts by type (scan/governance/healing)
   - Last 30 days of activity
   - Color-coded by event type
   - Stacked bars for easy comparison

3. **Severity Distribution (Pie Chart)**
   - Percentage breakdown of events by severity
   - Color-coded segments (success/info/warning/error)
   - Interactive legend with counts
   - Percentage labels on slices

**Statistics Cards:**
- 7-day average health score with trend indicator
- 7-day event count with change vs. previous week
- Current health score with governance and activity breakdown

**Implementation Highlights:**
```typescript
// Score history data generation
const scoreHistoryData = useMemo(() => {
  const dataPoints = []
  let currentHealthScore = repo.healthScore
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dayEvents = events.filter((e) => {
      const eventDate = new Date(e.timestamp)
      return eventDate.toDateString() === date.toDateString()
    })
    
    // Apply score changes from events
    dayEvents.forEach((event) => {
      if (event.metadata?.oldScore && event.metadata?.newScore) {
        const scoreChange = (event.metadata.newScore as number) - (event.metadata.oldScore as number)
        currentHealthScore += scoreChange
      }
    })
    
    dataPoints.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      healthScore: Math.round(currentHealthScore),
      governanceScore: Math.round(repo.governanceScore),
    })
  }
  
  return dataPoints
}, [events, repo])
```

### 4.3 Fleet Health Charts

**Component:** `FleetHealthCharts.tsx`

**Purpose:** Fleet-wide analytics showing aggregate health metrics across all repositories.

**Visualizations:**

1. **Fleet Average Scores (Radial Bar Chart)**
   - Three concentric rings for Health, Governance, Activity
   - Color-coded by metric type
   - Interactive tooltips

2. **Repository Health Distribution (Progress Bars)**
   - 6 score ranges (90-100, 80-89, 70-79, 60-69, 50-59, 0-49)
   - Percentage and count for each range
   - Color gradient from green to red

3. **Status Cards**
   - Healthy repos (score ≥ 80)
   - Degraded repos (score 50-79)
   - Critical repos (score < 50)
   - Each with percentage of fleet

4. **Top/Bottom Performers**
   - Top 5 repositories by health score
   - Bottom 5 repositories needing attention
   - Ranked list with scores

5. **Worker Pool Status**
   - Count of healthy/degraded/failed workers
   - Total jobs completed across all workers

---

## 5. Data Model

### 5.1 Core Types

**Repository**
```typescript
interface Repository {
  id: string
  provider: string
  owner: string
  name: string
  defaultBranch: string
  lastIndexedAt: string
  healthScore: number        // 0-100
  activityScore: number      // 0-100
  governanceScore: number    // 0-100
  claimsCount: number
  frameworks: string[]
}
```

**TimelineEvent**
```typescript
interface TimelineEvent {
  id: string
  repoId: string
  type: 'scan' | 'governance' | 'healing'
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'success' | 'critical'
  title: string
  description: string
  workerType?: WorkerType
  metadata?: {
    oldScore?: number
    newScore?: number
    duration?: number
    framework?: string
    claimType?: string
    issueCount?: number
    [key: string]: unknown
  }
}
```

**Worker**
```typescript
interface Worker {
  id: string
  type: WorkerType
  status: 'healthy' | 'degraded' | 'failed'
  lastRun: string
  jobsCompleted: number
  jobsFailed: number
  avgDuration: number
  queueSize: number
}
```

### 5.2 Persistence Strategy

All data persists using Spark KV storage:

```typescript
// Repository list
const [repositories, setRepositories] = useKV<Repository[]>('repositories', [])

// Worker pool
const [workers, setWorkers] = useKV<Worker[]>('workers', [])

// Timeline events
const [timelineEvents, setTimelineEvents] = useKV<TimelineEvent[]>('timeline-events', [])

// System logs
const [logs, setLogs] = useKV<LogEntry[]>('logs', [])

// Healdec logs
const [healdecLogs, setHealdecLogs] = useKV<HealdecLogEntry[]>('healdec-logs', [])
```

**Important:** Always use functional updates with `useKV` to avoid stale closures:

```typescript
// ✅ CORRECT
setRepositories((currentRepos) => [...currentRepos, newRepo])

// ❌ WRONG
setRepositories([...repositories, newRepo])
```

---

## 6. UI/UX Design System

### 6.1 AuraFX Neo-Glow Theme

**Color Tokens:**
```css
--aura-violet: oklch(0.72 0.15 290)  /* #A78BFA */
--aura-aqua: oklch(0.75 0.12 195)    /* #4FD1C5 */
--aura-coral: oklch(0.7 0.18 25)     /* #F87171 */
--aura-yellow: oklch(0.85 0.15 95)   /* #FACC15 */
--aura-blue: oklch(0.65 0.2 240)     /* Electric Blue */
```

**Glow Effects:**
```css
.glow-violet { box-shadow: 0 0 12px oklch(0.72 0.15 290 / 0.5); }
.glow-aqua { box-shadow: 0 0 12px oklch(0.75 0.12 195 / 0.5); }
.glow-coral { box-shadow: 0 0 12px oklch(0.7 0.18 25 / 0.5); }
.glow-yellow { box-shadow: 0 0 12px oklch(0.85 0.15 95 / 0.5); }
```

**Neon Borders:**
```css
.neon-border-violet { border: 1px solid oklch(0.72 0.15 290 / 0.3); }
.neon-border-aqua { border: 1px solid oklch(0.75 0.12 195 / 0.3); }
.neon-border-coral { border: 1px solid oklch(0.7 0.18 25 / 0.3); }
.neon-border-yellow { border: 1px solid oklch(0.85 0.15 95 / 0.3); }
```

### 6.2 Typography

**Font Stack:**
- **Headings**: Space Grotesk (Bold, SemiBold, Medium)
- **Body**: Inter (Regular, Medium, SemiBold)
- **Code/Data**: JetBrains Mono (Regular, Medium)

**Hierarchy:**
- H1: 32px / Bold / -0.02em / line-height 1.1
- H2: 24px / SemiBold / -0.01em / line-height 1.2
- H3: 18px / Medium / normal / line-height 1.3
- Body: 14px / Regular / normal / line-height 1.5
- Code: 13px / Regular / normal / line-height 1.4

### 6.3 Animation Principles

- **Duration**: 120-180ms for micro-interactions
- **Easing**: cubic-bezier(0.4, 0, 0.2, 1) - no bounce
- **Glow Transitions**: 200ms opacity changes
- **Chart Animations**: Disabled for instant feedback
- **Modal Transitions**: 180ms fade + 4px translate

---

## 7. Performance Optimizations

### 7.1 Memoization Strategy

All chart data generation uses `useMemo`:

```typescript
const scoreHistoryData = useMemo(() => {
  // Expensive computation
  return computedData
}, [events, repo])
```

### 7.2 Virtual Scrolling

Timeline and log components use `ScrollArea` for efficient rendering of large event lists.

### 7.3 Conditional Rendering

Charts only render when visible:

```typescript
<TabsContent value="charts">
  {/* Chart only renders when tab is active */}
  <HealthTrendCharts events={events} repo={repo} />
</TabsContent>
```

---

## 8. Mobile Responsiveness

### 8.1 Breakpoints

- Mobile: < 768px (4-column grid)
- Tablet: 768px - 1024px (8-column grid)
- Desktop: ≥ 1024px (12-column grid)

### 8.2 Adaptive Layout

- **Mobile**: Stacked single-column layout, bottom navigation
- **Tablet**: Two-column layout with collapsible sidebar
- **Desktop**: Three-column layout (navigation, content, logs)

---

## 9. Error Handling

### 9.1 Graceful Degradation

All components handle missing or empty data:

```typescript
{filteredEvents.length === 0 ? (
  <EmptyState message="No events found" />
) : (
  <EventList events={filteredEvents} />
)}
```

### 9.2 Try-Catch Blocks

Critical operations wrapped in error handling:

```typescript
try {
  const blob = new Blob([JSON.stringify(data)])
  // Export logic
} catch (error) {
  toast.error('Export failed')
  console.error('Export error:', error)
}
```

---

## 10. Future Enhancements

### 10.1 Backend Integration

- Replace simulated workers with real backend API
- Implement WebSocket for real-time updates
- Add authentication and authorization

### 10.2 Advanced Analytics

- Predictive health scoring with ML models
- Anomaly detection in timeline events
- Custom dashboard layouts per role

### 10.3 Collaboration Features

- Multi-user identity claim verification
- Team-based repository management
- Real-time collaboration on governance decisions

---

## 11. Testing Strategy

### 11.1 Component Testing

- Unit tests for data transformation logic
- Integration tests for chart rendering
- Visual regression tests for UI components

### 11.2 Performance Testing

- Chart rendering performance with large datasets
- Timeline scroll performance with 1000+ events
- Memory leak detection in long-running sessions

---

## 12. Deployment Architecture

### 12.1 Current (Spark Platform)

```
Spark Runtime
├── Vite Dev Server (Development)
└── Static Build (Production)
    ├── index.html
    ├── assets/
    └── src/ (transpiled)
```

### 12.2 Production (Future)

```
AWS/GCP/Azure
├── CDN (CloudFront/CloudFlare)
│   └── Static Assets
├── API Gateway
│   └── Backend Services
├── Database (PostgreSQL)
└── Cache (Redis)
```

---

This architecture document is the **source of truth** for AlgoBrainDoctor v0.1's frontend implementation. Any future changes MUST be documented here and implemented according to these specifications.

**Last Updated:** 2024-01-28  
**Version:** 4.0.0  
**Status:** Production Ready

---

## 🔗 Related Documentation

- **[Features](FEATURES.md)** - Detailed feature documentation
- **[Development Guide](DEVELOPMENT.md)** - Setup and development workflow
- **[API Reference](API.md)** - Component and type reference
- **[PRD](PRD.md)** - Product requirements document
- **[User Guide](USER_GUIDE.md)** - Usage instructions
- **[Deployment](DEPLOYMENT.md)** - Production deployment
- **[Contributing](CONTRIBUTING.md)** - How to contribute
