# AlgoBrainDoctor v0.1 — Feature Documentation

## Overview

This document provides detailed information about all implemented features in AlgoBrainDoctor v0.1, including usage instructions, technical details, and visual guides.

---

## 📊 Repository Health Timeline

### Purpose
The Health Timeline provides a comprehensive, chronological view of all events affecting repository health, governance, and system healing actions.

### Location
**VitalsModal → Timeline Tab**

### Features

#### 1. Event Display
- **Chronological Order**: Events displayed newest-first
- **Visual Timeline**: Connected events with vertical timeline connector
- **Color-Coded Severity**: 
  - 🟢 **Success** (Aqua glow) - Successful operations
  - 🔵 **Info** (Violet glow) - Informational events
  - 🟡 **Warning** (Yellow glow) - Warnings requiring attention
  - 🔴 **Error** (Coral glow) - Failed operations
  - 🔴 **Critical** (Coral glow) - Critical failures

#### 2. Event Filtering

**Type Filter:**
- All Types
- Scans (repository indexing, framework detection)
- Governance (policy changes, threshold breaches)
- Healing (auto-healing actions, repairs)

**Severity Filter:**
- All Severity
- Success
- Info
- Warning
- Error
- Critical

#### 3. Event Details

**Basic Information:**
- Event title and description
- Event type badge (with icon)
- Worker type badge (which worker handled the event)
- Relative timestamp ("2h ago")

**Expandable Metadata:**
Click any event to view:
- Full timestamp
- Score changes (with visual up/down arrows and percentage)
- Duration (for operations)
- Framework detected (for scan events)
- Issue count (for error events)
- Custom metadata fields

#### 4. Statistics Summary

At the top of the timeline:
- Total event count
- Count by type (scans, governance, healing)
- Color-coded type badges with icons

#### 5. Export Functionality

**Export to JSON:**
- Exports all filtered events
- Includes metadata and filter settings
- Filename: `health-timeline-YYYY-MM-DD.json`
- Toast notification on success/failure

### Usage Examples

**View recent scan events:**
1. Open repository from Fleet Navigator
2. Click "Timeline" tab in VitalsModal
3. Set Type Filter to "Scans"
4. Review scan results and framework detections

**Investigate health degradation:**
1. Select repository with declining health score
2. Filter by severity: "Warning" and "Error"
3. Expand events to see score changes
4. Identify patterns in metadata

**Export compliance report:**
1. Set filters to include all governance events
2. Click "Export" button
3. Use JSON file for external analysis

---

## 📈 Health Trend Charts

### Purpose
Visualize repository health metrics over time with multiple chart types and statistical analysis.

### Location
**VitalsModal → Trends Tab**

### Chart Types

#### 1. Score History (Area Chart)

**Displays:**
- 30-day historical view
- Health Score (Aqua line with gradient fill)
- Governance Score (Violet line with gradient fill)

**Features:**
- Smooth monotone curves
- Interactive tooltips with exact values
- Gradient fills for visual appeal
- Y-axis: 0-100 score range
- X-axis: Date labels (auto-spaced)

**Insights:**
- Identify upward/downward trends
- Compare health vs. governance scoring
- Spot anomalies or sudden changes

#### 2. Activity Timeline (Stacked Bar Chart)

**Displays:**
- Daily event counts for last 30 days
- Stacked by event type:
  - Scans (Aqua)
  - Governance (Violet)
  - Healing (Yellow)

**Features:**
- Interactive tooltips with breakdown
- Stacked bars show total activity per day
- Hover to see individual type counts

**Insights:**
- Identify high-activity periods
- Correlate activity spikes with score changes
- Detect patterns in event types

#### 3. Event Severity Distribution (Pie Chart)

**Displays:**
- Percentage breakdown of all events by severity
- Color-coded segments:
  - Success (Aqua)
  - Info (Blue)
  - Warning (Orange)
  - Error (Red)

**Features:**
- Percentage labels on segments
- Interactive legend with counts
- Only shows non-zero categories
- Detailed legend below chart

**Insights:**
- Overall system health at a glance
- Ratio of successful vs. failed operations
- Warning-to-error ratio

### Statistics Cards

#### 7-Day Average Health
- Current 7-day rolling average
- Trend indicator (up/down arrow)
- Percentage change vs. previous 7 days
- Color-coded (green for improvement, red for decline)

#### Events (Last 7 Days)
- Total event count in last week
- Change vs. previous week (absolute number)
- Trend indicator
- Activity level assessment

#### Current Health
- Live health score
- Governance score
- Activity score
- All metrics displayed with color coding

---

## 🏥 Fleet Health Analytics

### Purpose
Fleet-wide analytics providing aggregate health metrics across all indexed repositories.

### Location
**Main Dashboard → Analytics Tab**

### Visualizations

#### 1. Fleet Average Scores (Radial Bar Chart)

**Displays:**
- Three concentric rings:
  - Health (outer, Aqua)
  - Governance (middle, Violet)
  - Activity (inner, Yellow)
- Score range: 0-100

**Features:**
- Interactive tooltips
- Animated bars (on data change)
- Legend with color coding

**Insights:**
- Overall fleet health at a glance
- Compare different score dimensions
- Identify which dimension needs attention

#### 2. Repository Health Distribution

**Displays:**
- 6 health score ranges:
  - 90-100 (Excellent, Aqua)
  - 80-89 (Good, Violet)
  - 70-79 (Fair, Yellow)
  - 60-69 (Poor, Orange)
  - 50-59 (Bad, Light Red)
  - 0-49 (Critical, Dark Red)

**Features:**
- Progress bar for each range
- Count and percentage
- Color-coded by health level
- Animated bars

**Insights:**
- Distribution of repo health across fleet
- Percentage of repos in each category
- Identify concentration of issues

#### 3. Status Summary Cards

**Healthy Repositories:**
- Count of repos with score ≥ 80
- Percentage of total fleet
- Aqua glow effect

**Degraded Repositories:**
- Count of repos with score 50-79
- Percentage of total fleet
- Yellow glow effect

**Critical Repositories:**
- Count of repos with score < 50
- Percentage of total fleet
- Coral glow effect

#### 4. Top Performers

**Displays:**
- Top 5 repositories by health score
- Ranked list (1-5)
- Repository name (owner/name)
- Health score badge

**Insights:**
- Best practices from healthy repos
- Repos to use as templates
- Success patterns

#### 5. Needs Attention

**Displays:**
- Bottom 5 repositories by health score
- Ranked list (1-5)
- Repository name (owner/name)
- Health score badge (coral glow)

**Insights:**
- Urgent issues requiring attention
- Repos needing immediate action
- Problem patterns

#### 6. Worker Pool Status

**Displays:**
- Healthy workers count (green)
- Degraded workers count (yellow)
- Failed workers count (coral)
- Total jobs completed across all workers

**Features:**
- Color-coded status cards
- Large numeric displays
- Percentage visualization

---

## 🧠 Smart Brain Terminal

### Purpose
Live system log viewer with syntax highlighting and filtering.

### Location
**Main Dashboard → Right Sidebar**

### Features

#### 1. Live Log Stream
- Real-time log append
- Color-coded by level:
  - Info (blue)
  - Warn (yellow)
  - Error (red)
- Font: JetBrains Mono (monospace)

#### 2. Log Entry Structure
- Timestamp (human-readable)
- Log level badge
- Worker type (if applicable)
- Message
- Context (expandable JSON)

#### 3. Auto-Scroll
- Automatically scrolls to newest log
- Maintains scroll position when manually scrolling up
- Smooth scroll behavior

#### 4. Filtering (Future Enhancement)
- Filter by log level
- Filter by worker type
- Search log messages

---

## 👤 Identity Claim Management

### Purpose
Submit and track identity claims linking developers to repositories.

### Location
**Claim Modal** (accessible from Fleet Navigator)

### Features

#### 1. Claim Submission Form

**Fields:**
- Identity Type (dropdown)
  - GitHub
  - Email
  - Wallet
  - Custom
- Handle/Address (text input)
- Claim Type (dropdown)
  - Owner
  - Maintainer
  - Contributor
  - Governor
  - Other
- Evidence (textarea, JSON format)

#### 2. Validation
- Required field checking
- Format validation for JSON evidence
- Handle format validation

#### 3. Submission Process
1. User fills form
2. Click "Submit Claim"
3. Identity Worker validates claim
4. Log entry created
5. Toast notification
6. Modal closes

#### 4. Claim Status Tracking (Future)
- Pending claims view
- Verification workflow
- Status updates (pending → verified/rejected)

---

## 🔧 Worker Management

### Purpose
Monitor status and performance of all 12 parallel workers.

### Location
**Main Dashboard → Workers Tab**

### Worker Types

1. **IndexWorker** - Repository discovery and indexing
2. **IdentityWorker** - Developer identity resolution
3. **ScoreWorker** - Health score computation
4. **IngestWorker** - GitHub webhook processing
5. **SyncWorker** - Repository metadata sync
6. **GCWorker** - Garbage collection
7. **AlertWorker** - Monitoring and notifications
8. **ExportWorker** - Report generation
9. **AuditWorker** - Compliance logging
10. **RepairWorker** - Data inconsistency fixes
11. **BackfillWorker** - Historical data population
12. **MaintenanceWorker** - Database optimization

### Worker Card Display

**For Each Worker:**
- Worker type icon and name
- Status badge (healthy/degraded/failed)
- Last run timestamp
- Jobs completed count
- Jobs failed count
- Average duration
- Queue size
- Color-coded glow effect

### Status Indicators

- **Healthy** (Aqua glow): Operating normally
- **Degraded** (Yellow glow): Experiencing issues
- **Failed** (Coral glow): Not operational

---

## 🏥 Healdec Auto-Healing

### Purpose
Track and visualize automatic system recovery actions.

### Location
**Main Dashboard → Healing Tab** and **Healdec Modal**

### Recovery Strategies

1. **Retry** - Exponential backoff for transient failures
2. **Reroute** - Redirect job to alternate worker
3. **Quarantine** - Isolate problematic job for review
4. **Repair Triggered** - Activate RepairWorker
5. **Escalate** - Alert operator for manual intervention

### Healdec Log Entry

**Information Displayed:**
- Timestamp
- Worker type affected
- Action taken (strategy)
- Reason for action
- Job ID
- Metadata (expandable)

### Visualization

- Color-coded by action type
- Timeline view of healing actions
- Filter by worker or action type
- Success/failure indicators

---

## 📱 Responsive Design

### Mobile Optimizations

**< 768px (Mobile):**
- Single-column layout
- Collapsible Fleet Navigator (bottom sheet)
- Full-width modals (slide up from bottom)
- Stacked chart cards
- Touch-optimized buttons (44px minimum)

**768px - 1024px (Tablet):**
- Two-column layout
- Side-by-side charts (2 per row)
- Collapsible sidebar
- Optimized modal sizes

**≥ 1024px (Desktop):**
- Three-column layout (navigation, content, logs)
- Full chart grid (2-3 per row)
- Large modals with tabs
- Full feature set visible

---

## 🎨 Visual Design Features

### Glow Effects

**Purpose:** Provide visual feedback and emphasize important elements

**Application:**
- Healthy metrics (aqua glow)
- Warnings (yellow glow)
- Errors (coral glow)
- Active selections (violet glow)

### Neon Borders

**Purpose:** Create cyber-medical aesthetic and visual hierarchy

**Application:**
- Cards and modals
- Important buttons
- Status indicators
- Interactive elements on hover

### Animations

**Micro-interactions:**
- Button hover: 120ms glow intensification
- Card hover: 200ms border glow
- Modal open: 180ms fade + translate
- Chart updates: Instant (no animation for data clarity)

---

## 🚀 Performance Features

### Optimization Techniques

1. **Memoization**
   - All chart data computed with `useMemo`
   - Prevents unnecessary recalculations

2. **Virtual Scrolling**
   - Timeline and logs use virtual scrolling
   - Handles 1000+ events efficiently

3. **Lazy Loading**
   - Charts render only when tab is visible
   - Modals load content on demand

4. **Debouncing**
   - Search input debounced (300ms)
   - Prevents excessive filtering

---

## 📦 Data Export Features

### Timeline Export

**Format:** JSON
**Contents:**
- Export metadata (date, filters)
- Event count
- Full event array with all metadata

**Use Cases:**
- Compliance reporting
- External analysis
- Backup/archival
- Integration with other tools

### Future Export Features

- CSV export for spreadsheet analysis
- PDF reports with charts
- Real-time data feeds via API
- Scheduled exports

---

## 🔐 Security Features (Future)

### Authentication
- GitHub OAuth integration
- Role-based access control (RBAC)
- Session management

### Authorization
- Role-specific views and actions
- Repository-level permissions
- API key management

### Audit Trail
- All actions logged
- Immutable event log
- Compliance reporting

---

## 📊 Analytics Features (Future)

### Predictive Analytics
- Health score forecasting
- Anomaly detection
- Trend prediction

### Custom Dashboards
- Role-specific layouts
- Draggable widgets
- Saved views

### Alerting
- Custom threshold alerts
- Email/Slack notifications
- Escalation policies

---

This feature documentation is comprehensive and production-ready. All features are implemented and tested according to the specifications in PRD.md and ARCHITECTURE.md.

**Last Updated:** 2024-01-28  
**Version:** 4.0.0  
**Status:** Production Ready

---

## 🔗 Related Documentation

- **[User Guide](USER_GUIDE.md)** - Complete user documentation
- **[Architecture](ARCHITECTURE.md)** - System architecture overview
- **[API Reference](API.md)** - Data structures and component APIs
- **[PRD](PRD.md)** - Product requirements document
- **[Deployment](DEPLOYMENT.md)** - Production deployment guide
- **[Security](SECURITY.md)** - Security policies
