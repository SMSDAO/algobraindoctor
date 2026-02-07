# AlgoBrainDoctor v0.1 — User Guide

Welcome to AlgoBrainDoctor, your cyber-medical repository health monitoring platform. This guide will help you navigate the interface and make the most of its powerful features.

---

## 🚀 Getting Started

### First Time Setup

1. **Open the Dashboard**
   - Navigate to the application URL
   - You'll see an empty Fleet Navigator

2. **Load Sample Data**
   - Click "Load Sample Data" button in the Fleet Navigator
   - Sample repositories, workers, and events will be generated
   - Toast notification confirms successful data load

3. **Explore the Interface**
   - Left: Fleet Navigator (repository list)
   - Center: Analytics, Workers, Healing, Claims tabs
   - Right: Live System Log terminal

---

## 🧭 Interface Overview

### Header Bar

**Left Side:**
- **🧠 AlgoBrainDoctor** logo and title
- Version info: "Social Index & Identity Network v0.1"

**Right Side:**
- **Worker Status Badge**: Shows healthy/total workers
- **Jobs Badge**: Total jobs completed
- **Avg Health Badge**: Fleet average health score
- **Role Selector**: Choose your role (User/Admin/Developer/Validator/Analyst)

### Three-Column Layout

**Left Column - Fleet Navigator:**
- Search bar for filtering repositories
- Repository cards with health scores
- "Submit Identity Claim" button

**Center Column - Main Content:**
- Tabbed interface with 4 sections:
  - Analytics (fleet health charts)
  - Workers (12 parallel workers status)
  - Healing (Healdec auto-healing log)
  - Claims (identity claim management)

**Right Column - Live System Log:**
- Real-time log stream
- Color-coded by severity
- Auto-scrolling

---

## 📖 Common Tasks

### Task 1: Check Repository Health

**Goal:** View detailed health metrics for a specific repository

**Steps:**
1. Locate repository in Fleet Navigator (left sidebar)
   - Use search bar if needed
2. Click on the repository card
3. VitalsModal opens with three tabs:
   - **Overview**: Current metrics and details
   - **Trends**: Historical charts
   - **Timeline**: Event history

**What You'll See:**
- Health Score (0-100)
- Activity Score
- Governance Score
- Last indexed timestamp
- Detected frameworks
- Identity claims count

**Interpreting Scores:**
- **90-100**: Excellent health (Aqua glow)
- **80-89**: Good health (Violet)
- **70-79**: Fair health (Yellow)
- **60-69**: Needs attention (Orange)
- **Below 60**: Critical (Red/Coral)

---

### Task 2: Analyze Health Trends

**Goal:** Understand how repository health has changed over time

**Steps:**
1. Open repository in VitalsModal
2. Click **"Trends"** tab
3. Review three types of charts:

**Score History Chart (Top):**
- Shows 30-day health and governance trends
- Look for:
  - Upward trends (improving)
  - Downward trends (degrading)
  - Sudden spikes or drops
  - Correlation between health and governance

**Activity Timeline (Middle):**
- Shows daily event counts
- Three types: Scans, Governance, Healing
- Look for:
  - High activity periods
  - Gaps in scanning
  - Healing action frequency

**Severity Distribution (Bottom):**
- Pie chart of event outcomes
- Look for:
  - High error percentage (concerning)
  - Mostly success (healthy)
  - Warning/error ratio

**Statistics Cards (Top Row):**
- **7-Day Avg Health**: Current vs. previous week
- **Events (7 days)**: Activity level
- **Current Health**: Live scores

---

### Task 3: Investigate Timeline Events

**Goal:** View detailed history of repository events

**Steps:**
1. Open repository in VitalsModal
2. Click **"Timeline"** tab
3. Review event list (newest first)

**Filtering Events:**

**By Type:**
- **All Types**: Shows everything
- **Scans**: Repository indexing, framework detection
- **Governance**: Policy changes, threshold breaches
- **Healing**: Auto-healing actions, repairs

**By Severity:**
- **All Severity**: Shows everything
- **Success**: Successful operations (aqua glow)
- **Info**: Informational events (violet glow)
- **Warning**: Attention needed (yellow glow)
- **Error**: Failed operations (coral glow)
- **Critical**: Severe failures (coral glow)

**Expanding Events:**
- Click any event to view full details
- See metadata like:
  - Score changes (with percentage)
  - Operation duration
  - Framework detected
  - Issue counts
  - Custom data fields

**Exporting Timeline:**
1. Set desired filters
2. Click "Export" button
3. JSON file downloads with all filtered events

---

### Task 4: Monitor Fleet Health

**Goal:** Get overview of all repositories at once

**Steps:**
1. Go to **Analytics** tab (center column)
2. Review Fleet Health Charts

**Key Metrics:**

**Fleet Average Scores (Radial Chart):**
- Three rings: Health, Governance, Activity
- Quick assessment of overall fleet health

**Repository Health Distribution:**
- How many repos in each score range
- Percentage of fleet per category
- Identify where most repos sit

**Status Cards:**
- **Healthy Repos**: Score ≥ 80 (goal: high percentage)
- **Degraded Repos**: Score 50-79 (need attention)
- **Critical Repos**: Score < 50 (urgent action needed)

**Top Performers:**
- 5 healthiest repositories
- Models for other repos
- Best practices examples

**Needs Attention:**
- 5 lowest scoring repositories
- Priority for improvement
- Urgent action items

---

### Task 5: Check Worker Status

**Goal:** Ensure all system workers are operating correctly

**Steps:**
1. Go to **Workers** tab (center column)
2. Review 12 worker cards

**Worker Card Information:**
- **Status**: Healthy/Degraded/Failed
- **Last Run**: When worker last executed
- **Jobs Completed**: Total successful jobs
- **Jobs Failed**: Total failed jobs
- **Avg Duration**: Average job execution time
- **Queue Size**: Pending jobs

**Status Meanings:**
- **Healthy** (Aqua glow): All systems normal
- **Degraded** (Yellow glow): Experiencing issues but functional
- **Failed** (Coral glow): Not operational, needs attention

**12 Worker Types:**
1. **Index**: Repository discovery
2. **Identity**: Developer identification
3. **Score**: Health computation
4. **Ingest**: Webhook processing
5. **Sync**: Metadata synchronization
6. **GC**: Cleanup operations
7. **Alert**: Monitoring notifications
8. **Export**: Report generation
9. **Audit**: Compliance logging
10. **Repair**: Data fixes
11. **Backfill**: Historical data
12. **Maintenance**: System optimization

---

### Task 6: Review Auto-Healing Actions

**Goal:** Understand what the system is doing automatically

**Steps:**
1. Go to **Healing** tab (center column)
2. Review recent healing actions
3. Click "View Full Log" for complete history

**Healing Actions:**
- **Retry**: Job retried with backoff
- **Reroute**: Job sent to different worker
- **Quarantine**: Job isolated for review
- **Repair Triggered**: RepairWorker activated
- **Escalate**: Manual intervention needed

**Healdec Log Entry:**
- **Timestamp**: When action occurred
- **Action**: Strategy applied
- **Reason**: Why action was taken
- **Affected Worker**: Which worker had the issue

**Interpreting Healing Activity:**
- **Low healing rate** (<5%): System healthy
- **Moderate healing** (5-10%): Some issues being resolved
- **High healing rate** (>10%): System experiencing problems

---

### Task 7: Submit Identity Claim

**Goal:** Link your identity to a repository

**Steps:**
1. Click **"Submit Identity Claim"** button (Fleet Navigator)
2. Fill out claim form:
   - **Identity Type**: GitHub/Email/Wallet/Custom
   - **Handle**: Your username or address
   - **Claim Type**: Owner/Maintainer/Contributor/Governor/Other
   - **Evidence**: JSON object with proof
3. Click **"Submit"** button
4. Claim processed by IdentityWorker
5. Log entry created
6. Toast notification confirms submission

**Evidence Format Example:**
```json
{
  "proof_type": "github_commit",
  "commit_sha": "abc123...",
  "verified_at": "2024-01-28T10:00:00Z"
}
```

---

### Task 8: Search Repositories

**Goal:** Quickly find specific repository

**Steps:**
1. Click search input (Fleet Navigator)
2. Type repository name or owner
3. Results filter in real-time
4. Search matches both owner and name

**Search Tips:**
- Partial matches work
- Case-insensitive
- Results update as you type
- Clear search to see all repos

---

### Task 9: Monitor Live Logs

**Goal:** Watch system activity in real-time

**Steps:**
1. Check right sidebar (Live System Log)
2. Logs auto-scroll as new entries arrive
3. Color-coded by level:
   - Blue: Info
   - Yellow: Warning
   - Red: Error

**Log Entry Information:**
- Timestamp
- Log level
- Worker type (if applicable)
- Message
- Context data (expandable)

**Log Patterns to Watch:**
- Frequent errors: System issues
- Claim submissions: User activity
- Worker completions: Normal operations
- Healing actions: Automatic recovery

---

## 🎯 Role-Specific Workflows

### Admin Workflow

**Daily Tasks:**
1. Check worker pool status (Workers tab)
2. Review healing activity (Healing tab)
3. Identify critical repos (Analytics tab)
4. Monitor system logs (right sidebar)

**Weekly Tasks:**
1. Review fleet health trends
2. Export compliance reports
3. Analyze healing patterns
4. Plan capacity upgrades

### Developer Workflow

**Daily Tasks:**
1. Check owned repos health
2. Review scan results
3. Address warnings/errors
4. Monitor activity logs

**Weekly Tasks:**
1. Analyze health trends
2. Compare against fleet average
3. Submit/update identity claims
4. Review governance events

### Analyst Workflow

**Daily Tasks:**
1. Export timeline data
2. Generate health reports
3. Identify patterns
4. Track score changes

**Weekly Tasks:**
1. Trend analysis
2. Fleet-wide statistics
3. Correlation studies
4. Predictive modeling

---

## 💡 Pro Tips

### Tip 1: Use Filters Effectively
- Combine type and severity filters for precise searches
- Filter timeline to specific event types
- Export filtered data for focused analysis

### Tip 2: Watch the Trends Tab
- Trends reveal patterns not visible in snapshots
- 7-day averages smooth out noise
- Compare health vs. governance scores

### Tip 3: Monitor Worker Health
- Degraded workers indicate system stress
- High queue sizes suggest capacity issues
- Failed workers need immediate attention

### Tip 4: Learn from Top Performers
- Study repos with highest scores
- Identify common patterns
- Apply lessons to other repos

### Tip 5: Export Data Regularly
- Create compliance audit trails
- Enable external analysis
- Backup historical data

### Tip 6: Use Color Cues
- Aqua = Good/Success
- Yellow = Warning/Caution
- Coral = Error/Critical
- Violet = Info/Identity

### Tip 7: Check Timestamps
- Hover over relative times for full datetime
- Identify gaps in scanning
- Track event frequency

### Tip 8: Expand Event Details
- Click events to see full metadata
- Score changes show improvement/decline
- Duration helps identify performance issues

---

## 🐛 Troubleshooting

### Issue: No Data Visible

**Solution:**
1. Click "Load Sample Data" button
2. Wait for toast confirmation
3. Refresh if needed

### Issue: Charts Not Updating

**Solution:**
1. Close and reopen modal
2. Switch tabs to trigger re-render
3. Check browser console for errors

### Issue: Search Not Working

**Solution:**
1. Clear search input
2. Try different search term
3. Check for typos

### Issue: Export Fails

**Solution:**
1. Check browser download settings
2. Ensure pop-ups not blocked
3. Try smaller date range

### Issue: Slow Performance

**Solution:**
1. Close unused modals
2. Clear old timeline events
3. Reduce number of repos loaded

---

## 🎨 Understanding Visual Design

### Glow Effects
- **Purpose**: Emphasize important information
- **Colors**: Match semantic meaning
- **Intensity**: Increases on hover/selection

### Neon Borders
- **Purpose**: Create cyber-medical aesthetic
- **Usage**: Cards, modals, buttons
- **Style**: Subtle transparency, soft glow

### Typography
- **Space Grotesk**: Headlines and titles
- **Inter**: Body text and UI
- **JetBrains Mono**: Code and data

### Animations
- **Duration**: 120-200ms (quick and smooth)
- **Style**: No bounce, no overshoot
- **Purpose**: State changes and feedback

---

## 📱 Mobile Usage

### Layout Changes
- Single-column view
- Bottom navigation
- Slide-up modals
- Touch-optimized buttons

### Gestures
- Tap: Select/expand
- Swipe: Navigate tabs (future)
- Long press: Context menu (future)

### Optimizations
- Larger tap targets
- Simplified charts
- Collapsible sections
- Reduced animations

---

## 🔐 Best Practices

### Security
- Use strong evidence for claims
- Review permissions regularly
- Monitor access logs
- Rotate API keys (future)

### Performance
- Export and archive old events
- Keep worker queues low
- Monitor system resources
- Close unused modals

### Data Quality
- Regular repository scanning
- Verify identity claims
- Update metadata promptly
- Clean up stale records

---

## 📞 Getting Help

### Resources
- **PRD.md**: Product requirements
- **ARCHITECTURE.md**: Technical details
- **FEATURES.md**: Feature documentation
- **README.md**: Quick start guide

### Support Channels (Future)
- GitHub Issues
- Community Forum
- Email Support
- In-App Chat

---

## 🚀 What's Next?

### Coming Soon
- Real-time WebSocket updates
- Custom dashboard layouts
- Advanced filtering options
- Scheduled reports
- Team collaboration features
- API access
- Mobile app

### Feedback
Your feedback helps improve AlgoBrainDoctor!
- Report bugs
- Suggest features
- Share use cases
- Contribute code

---

Thank you for using AlgoBrainDoctor v0.1! 🧠⚡

**Version:** 4.0.0  
**Last Updated:** 2024-01-28  
**Status:** Production Ready

---

## 🔗 Related Documentation

- **[Features](FEATURES.md)** - Detailed feature documentation
- **[Architecture](ARCHITECTURE.md)** - System architecture overview
- **[API Reference](API.md)** - Component APIs and types
- **[Development Guide](DEVELOPMENT.md)** - Development workflow
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
- **[Contributing](CONTRIBUTING.md)** - How to contribute
