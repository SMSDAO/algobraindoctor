# AlgoBrainDoctor v0.1 — Social Index & Identity Claim Network

A cyber-medical operator dashboard for autonomous repo indexing, identity resolution, and governance intelligence.

**Experience Qualities**:
1. **Surgical Precision** — Every interaction feels deterministic, every action auditable, every state observable
2. **Neo-Medical Cyber** — Dark laboratory aesthetic with soft neon diffusion creating a high-tech diagnostic environment
3. **Operator-Grade Control** — Zero visual noise, mission-critical data surfaced instantly, full system transparency

**Complexity Level**: Complex Application (advanced functionality with multiple views)
- Multi-role adaptive interface (User, Admin, Developer, Validator, Analyst)
- Real-time worker supervision across 12 parallel workers
- Auto-healing engine with deterministic repair flows
- Social index with identity claims, trust scoring, and governance health
- Full orchestrator observability with event streams and metrics

## Essential Features

### Worker Health Dashboard
- **Functionality**: Real-time visibility into all 12 parallel workers (Index, Identity, Score, Ingest, Sync, GC, Alert, Export, Audit, Repair, Backfill, Maintenance)
- **Purpose**: Ensure operators can instantly assess system health and identify degraded workers
- **Trigger**: Dashboard loads on app start, updates every 2 seconds
- **Progression**: Dashboard load → Worker status fetch → Color-coded health cards → Click worker → Detailed metrics modal → View job queue → Trigger manual actions
- **Success criteria**: Sub-100ms dashboard updates, color-coded status (healthy/degraded/failed), click-through to job details

### Healdec Auto-Healing Log
- **Functionality**: Chronological view of all auto-healing actions with classification, strategy, and outcome
- **Purpose**: Full audit trail of system self-repair for debugging and compliance
- **Trigger**: Accessible from right rail, filterable by worker/action type
- **Progression**: Open log → Filter by worker/date → Select healing event → View failure classification → See recovery strategy → Check repair outcome → Export for analysis
- **Success criteria**: Real-time log append, filterable by 8 action types, click-through to affected jobs

### Repository Vitals View
- **Functionality**: Real-time governance health, activity scores, and identity claims for each indexed repo
- **Purpose**: Surface repo health at a glance for governance decisions
- **Trigger**: Select repo from fleet navigator or search
- **Progression**: Select repo → Load vitals card → View health score/activity/claims → Click "Full Report" → See detailed timeline → Trigger rescan → View framework detection
- **Success criteria**: <200ms vitals load, animated pulse for live metrics, timeline of all scan events

### Identity Claim Management
- **Functionality**: Submit, verify, and revoke identity claims (owner/maintainer/contributor/governor)
- **Purpose**: Establish verifiable links between GitHub identities, wallets, and repos
- **Trigger**: User submits claim via modal or API endpoint
- **Progression**: Open claim modal → Fill identity type/handle/evidence → Submit → IdentityWorker validates → Status updates (pending → verified/rejected) → Score recomputation → Notification
- **Success criteria**: Inline validation, JSONB evidence storage, status transitions auditable, score updates within 5 seconds

### Smart Brain Terminal
- **Functionality**: Live log stream from orchestrator, Healdec, and all workers with syntax highlighting
- **Purpose**: Developer/operator visibility into system execution in real-time
- **Trigger**: Always-on in right rail, filterable by log level/worker
- **Progression**: Terminal renders → Logs stream in → Color-coded by level → Click log line → Expand context → Copy/export → Filter by worker
- **Success criteria**: <50ms log append latency, color-coded (info/warn/error), collapsible detail view

## Edge Case Handling

- **Worker Failure Loop**: Healdec detects infinite retry patterns and quarantines jobs after 5 attempts with exponential backoff
- **Stale Data**: GCWorker automatically prunes records older than 90 days with no activity
- **Identity Conflict**: IdentityWorker flags duplicate claims and surfaces them in admin review queue
- **Network Timeouts**: IngestWorker uses circuit breaker pattern with 3-retry limit and fallback to cached data
- **Database Connection Loss**: Orchestrator halts all workers, logs critical alert, and waits for manual intervention
- **Malformed Webhooks**: IngestWorker validates payloads and logs errors without crashing
- **Concurrent Claim Submission**: Optimistic locking with version field prevents race conditions

## Design Direction

The interface should evoke the feeling of a **high-tech medical research facility at night** — sterile, precise, and cyber-luminescent. Users should feel like surgeons operating on a distributed system, with every tool purposeful and every metric critical. The neon glow suggests both vitality (healthy systems pulse with energy) and alert states (errors glow with warning heat).

## Color Selection

AuraFX Neo-Glow + GitHub Dark palette optimized for 8+ hour operator sessions.

- **Primary Color**: Violet Aura (oklch(0.72 0.15 290)) — Medical intelligence, identity verification, core modals. Communicates trust and precision.
- **Secondary Colors**: 
  - Aqua Pulse (oklch(0.75 0.12 195)) — Live metrics, sync operations, vitals
  - Coral Heat (oklch(0.7 0.18 25)) — Errors, alerts, Healdec failures
  - Cyber Yellow (oklch(0.85 0.15 95)) — Warnings, scan detection, pending states
- **Accent Color**: Electric Blue (oklch(0.65 0.2 240)) — Blackbox traces, deep execution views, terminal cursors
- **Foreground/Background Pairings**:
  - Background Dark (oklch(0.12 0.01 250) #0B0E14): White text (oklch(0.98 0 0) #FAFAFA) - Ratio 14.2:1 ✓
  - Panel Background (oklch(0.15 0.01 250) #11151C): Light gray text (oklch(0.9 0 0) #E5E5E5) - Ratio 10.8:1 ✓
  - Violet Aura (oklch(0.72 0.15 290)): White text (oklch(0.98 0 0)) - Ratio 5.2:1 ✓
  - Aqua Pulse (oklch(0.75 0.12 195)): Dark text (oklch(0.15 0.01 250)) - Ratio 9.1:1 ✓
  - Coral Heat (oklch(0.7 0.18 25)): White text (oklch(0.98 0 0)) - Ratio 4.9:1 ✓

## Font Selection

Typography should feel **technical, crisp, and operator-grade** — reminiscent of medical displays and command terminals. Monospace for data, sans-serif for UI.

- **Typographic Hierarchy**:
  - H1 (Module Titles): Space Grotesk Bold / 32px / -0.02em letter spacing / line-height 1.1
  - H2 (Section Headers): Space Grotesk SemiBold / 24px / -0.01em / line-height 1.2
  - H3 (Card Titles): Space Grotesk Medium / 18px / normal / line-height 1.3
  - Body (UI Text): Inter Regular / 14px / normal / line-height 1.5
  - Code/Data: JetBrains Mono Regular / 13px / normal / line-height 1.4
  - Small (Metadata): Inter Regular / 12px / normal / line-height 1.4 / opacity 0.7

## Animations

Animations should feel **clinical and deterministic** — no bounce, no overshoot, just smooth fades and glows. Every animation serves a functional purpose: state change, live update, or attention direction.

- Hover glow intensifies over 120ms with cubic-bezier(0.4, 0, 0.2, 1)
- Modal open: 180ms fade + 4px translate from center
- Worker status change: 250ms color pulse with glow expansion
- Live metric update: 300ms number count-up with aqua pulse flash
- Log append: 80ms slide-in from bottom with coral/aqua glow based on level
- Neon edge sweep: 200ms border-gradient rotation on focus

## Component Selection

- **Components**: 
  - Dialog (modals for Vitals, Health Report, Blackbox, Immunizer)
  - Card (RepoCard, WorkerCard, ScanBox with custom neon borders)
  - Tabs (role-adaptive dashboard views)
  - Table (Healdec log, identity claims with sortable columns)
  - Badge (status indicators with glow variants)
  - ScrollArea (terminal, log streams)
  - Select (worker filter, repo switcher)
  - Input (search, claim forms with inline validation)
  - Button (primary: violet glow, destructive: coral glow, ghost: subtle border)
  - Separator (dark borders with subtle glow on section divisions)
  
- **Customizations**:
  - NeonCard: Card with animated border-glow using box-shadow + border-image-source
  - PulseMetric: Animated number display with glow flash on update
  - WorkerStatusBadge: Custom badge with 3-state glow (healthy: aqua, degraded: yellow, failed: coral)
  - SmartBrainTerminal: Custom ScrollArea with syntax-highlighted log lines
  - GlowButton: Button with hover-activated neon glow matching semantic color
  
- **States**:
  - Buttons: default (border glow), hover (full glow + 4px translate-y), active (glow compress), disabled (50% opacity, no glow)
  - Inputs: default (subtle border), focus (violet ring glow), error (coral ring), success (aqua ring)
  - Cards: default (panel bg), hover (border glow intensify), selected (violet border + glow)
  
- **Icon Selection**:
  - Activity/Vitals: Pulse, ChartLine
  - Workers: Gear, CircleNotch (spinning when active)
  - Healing: ShieldCheck, Wrench
  - Identity: User, IdentificationCard, Key
  - Alerts: Warning, WarningCircle, XCircle
  - Success: CheckCircle
  - Repos: GitBranch, GitCommit, GitPullRequest
  - Terminal: Terminal, Code
  
- **Spacing**:
  - Card padding: 6 (24px)
  - Modal padding: 8 (32px)
  - Section gaps: 8 (32px)
  - Component gaps: 4 (16px)
  - Inline gaps: 2 (8px)
  - Border radius: 8px (consistent neon-edge aesthetic)
  
- **Mobile**:
  - Left nav collapses to bottom bar with icons only
  - Center content becomes full-width stacked panels
  - Right rail becomes slide-out drawer triggered by floating button
  - Cards stack vertically with preserved glow effects
  - Tables become scrollable with sticky headers
  - Modals slide up from bottom instead of center fade

---

## 🔗 Related Documentation

- **[Features](FEATURES.md)** - Detailed feature documentation
- **[Architecture](ARCHITECTURE.md)** - System architecture overview
- **[User Guide](USER_GUIDE.md)** - How to use the application
- **[Development Guide](DEVELOPMENT.md)** - Development setup
- **[API Reference](API.md)** - Component APIs
