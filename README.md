# AlgoBrainDoctor v0.1 — Social Index & Identity Network

> **Production-ready repository health monitoring and auto-healing platform**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-4.0.0-purple.svg)](PRD.md)
[![Status](https://img.shields.io/badge/status-production--ready-green.svg)](PRD.md)

---

## 🎯 Overview

Brain-Doctor Hospital V4 is an advanced GitOps health monitoring system that continuously scans repositories, tracks developer identities, computes health scores, and automatically remediates issues through intelligent auto-healing strategies.

### Key Features

- 🔄 **Self-Healing**: Autonomous error detection and recovery via Healdec engine
- ⚡ **12 Parallel Workers**: Specialized workers for indexing, scoring, ingestion, and more
- 🎛️ **One-File Orchestrator**: Centralized job scheduling and worker supervision
- 📊 **Real-Time Scoring**: Repository health scores (0-100) with detailed breakdowns
- 🔍 **Identity Resolution**: Developer identity tracking and claim management
- 🎨 **Aura FX UI**: Neo-glow cyber-medical theme with GitHub Dark base
- 🚀 **Production-Ready**: Full-stack React/TypeScript application

---

## 📚 Documentation

### Core Features

- **[PRD.md](PRD.md)** - Complete product requirements document
  - Essential features and user flows
  - Design direction and aesthetic principles
  - Component selection and UI/UX specifications

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Dashboard

Open http://localhost:5173 in your browser.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              AlgoBrainDoctor Dashboard              │
│  Repository Health • Identity Claims • Analytics    │
└──────────────┬──────────────────────────────────────┘
               │
     ┌─────────┴─────────┐
     │   12 Workers Pool  │ ←─── Healdec Auto-Healing
     └─────────┬─────────┘
               │
     ┌─────────┴─────────┐
     │  Data Persistence  │ (useKV + spark.kv)
     └───────────────────┘
```

### Core Components

- **Fleet Navigator**: Repository browser with search and health indicators
- **VitalsModal**: Real-time repository health dashboard with trends
- **HealthTimeline**: Detailed event timeline showing all scans and governance events
- **HealthTrendCharts**: Visualizations of health trends over time
- **FleetHealthCharts**: Fleet-wide analytics and statistics
- **SmartBrainTerminal**: Live system log viewer
- **ClaimModal**: Identity claim submission interface
- **HealdecModal**: Auto-healing activity log

---

## 🎨 UI/UX Design System

### Aura FX Neo-Glow + GitHub Dark Theme

**Color Palette:**
- **Violet Aura** (`#A78BFA` / `oklch(0.72 0.15 290)`) - Primary actions and glow effects
- **Aqua Pulse** (`#4FD1C5` / `oklch(0.75 0.12 195)`) - Health indicators and success states
- **Coral Heat** (`#F87171` / `oklch(0.7 0.18 25)`) - Alerts and warnings
- **Cyber Yellow** (`#FACC15` / `oklch(0.85 0.15 95)`) - Caution states and highlights

**Typography:**
- **Headings**: Space Grotesk (Bold/SemiBold/Medium)
- **Body**: Inter (Regular)
- **Code/Data**: JetBrains Mono (Regular)

**Design Principles:**
- Surgical Precision — Deterministic interactions
- Neo-Medical Cyber — Dark laboratory aesthetic with soft neon diffusion
- Operator-Grade Control — Zero visual noise, mission-critical data surfaced instantly

---

## 🔧 12 Parallel Workers

1. **IndexWorker** - Discover repositories
2. **IdentityWorker** - Extract developer identities
3. **ScoreWorker** - Compute health scores
4. **IngestWorker** - Process GitHub webhooks
5. **SyncWorker** - Sync repo metadata
6. **GCWorker** - Garbage collection
7. **AlertWorker** - Monitor and notify
8. **ExportWorker** - Generate reports
9. **AuditWorker** - Compliance logging
10. **RepairWorker** - Fix data inconsistencies
11. **BackfillWorker** - Historical data population
12. **MaintenanceWorker** - Database optimization

---

## 🏥 Healdec Auto-Healing Engine

Autonomous recovery system with 5 strategies:

1. **Retry** - Exponential backoff for transient failures
2. **Restart** - Worker process restart for crashes
3. **Quarantine** - Isolate problematic jobs for review
4. **Rollback** - Undo partial changes with compensating transactions
5. **Escalate** - Alert on-call for critical failures

---

## 📊 Features Implemented

### ✅ Repository Health Timeline
- Detailed event timeline showing all scans and governance events
- Filter by event type (scan/governance/healing) and severity
- Expandable event details with metadata
- Real-time updates with color-coded severity indicators
- Export functionality for timeline data

### ✅ Health Trend Charts
- Score history visualization (30-day trends)
- Activity timeline (daily event counts by type)
- Event severity distribution (pie chart)
- 7-day rolling averages with trend indicators
- Fleet-wide statistics and health distribution

### ✅ Fleet Analytics
- Repository health distribution across score ranges
- Top performers and repos needing attention
- Worker pool status monitoring
- Real-time metrics with animated updates

---

## 🎯 Role-Based Views

The dashboard adapts to five distinct roles:

- **User**: Portfolio, activity, rewards, quick actions
- **Admin**: Worker health, Healdec logs, system vitals, governance queue
- **Developer**: API keys, webhooks, error traces, sandbox console
- **Validator**: Node uptime, slashing risk, performance metrics
- **Analyst**: Query builder, table explorer, graph surfaces, export tools

---

## 🔍 Key Components

### VitalsModal
Real-time repository health dashboard with three tabs:
- **Overview**: Health metrics, repository details, detected frameworks
- **Trends**: Charts showing score history, activity, and severity distribution
- **Timeline**: Detailed event timeline with filtering and export

### HealthTimeline
Comprehensive event timeline featuring:
- Filter by event type and severity
- Expandable event details with metadata
- Color-coded severity indicators with glow effects
- Relative timestamps with full datetime on expand
- Export to JSON functionality

### HealthTrendCharts
Visualization suite including:
- Area chart: 30-day score history
- Bar chart: Daily activity by type
- Pie chart: Event severity distribution
- Stats cards: 7-day averages and trends

---

## 📱 Mobile Responsiveness

- Collapsible fleet navigator
- Stacked modals optimized for touch
- Bottom navigation for primary actions
- Scrollable tables with sticky headers
- Touch-optimized neon buttons with proper hit areas

---

## 🚀 Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + Custom Aura FX theme
- **UI Components**: shadcn/ui v4
- **Charts**: Recharts
- **Icons**: Phosphor Icons
- **State**: React hooks + Spark KV persistence
- **Build**: Vite 7
- **Fonts**: Space Grotesk, Inter, JetBrains Mono

---

## 📈 Performance Metrics

- Sub-100ms dashboard updates
- <200ms vitals load time
- <50ms log append latency
- Real-time worker status updates every 2 seconds
- Optimized chart rendering with memoization

---

## 🤝 Contributing

This is a Spark application designed for production use. To contribute:

1. Review the PRD.md for design specifications
2. Follow the AuraFX design system guidelines
3. Maintain the cyber-medical aesthetic
4. Ensure all interactions are deterministic and observable

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Version:** 4.0.0  
**Last Updated:** 2024-01-28  
**Maintained By:** AlgoBrainDoctor Core Team  

Made with 🧠⚡ by the AlgoBrainDoctor team
