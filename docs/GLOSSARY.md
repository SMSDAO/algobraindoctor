# Glossary

> **Definitions of key terms and concepts used in AlgoBrainDoctor**

This glossary provides clear definitions for technical terms, acronyms, and concepts used throughout the AlgoBrainDoctor documentation and codebase.

---

## A

### Activity Score
A metric (0-100) that measures the level of development activity in a repository based on commits, pull requests, and other contributions.

### AuraFX
The custom design system used in AlgoBrainDoctor, featuring a neo-glow cyber-medical aesthetic with soft neon effects and dark theme.

### Auto-Healing
Automatic error detection and recovery system (see Healdec) that handles failures without manual intervention.

---

## B

### Backfill
The process of populating historical data that was not previously captured or processed.

### Badge
A UI component that displays status, counts, or labels in a compact, color-coded format.

---

## C

### CDN (Content Delivery Network)
A distributed network of servers that delivers web content to users based on their geographic location.

### Claim
See Identity Claim.

### Component
A reusable, self-contained piece of UI in React. Components can be composed together to build complex interfaces.

### CSP (Content Security Policy)
A security standard that helps prevent XSS attacks by specifying which content sources are allowed to load.

---

## D

### Dashboard
The main interface of AlgoBrainDoctor where users monitor repository health, worker status, and system metrics.

### Debouncing
A programming technique that delays executing a function until after a specified time has passed since it was last invoked.

---

## E

### ESLint
A tool for identifying and reporting patterns in JavaScript/TypeScript code to maintain code quality and consistency.

### Event
A record of something that happened in the system (e.g., repository scan, governance change, healing action).

---

## F

### Fleet
The collection of all repositories being monitored by AlgoBrainDoctor.

### Fleet Navigator
The left sidebar component that displays the list of monitored repositories with search and filtering capabilities.

### Framework Detection
The automatic identification of programming languages, frameworks, and tools used in a repository.

---

## G

### Garbage Collection (GC)
The automated process of removing old or unused data to free up storage space and maintain system performance.

### Glow Effect
A visual effect in the AuraFX design system that creates a soft, neon-like luminescence around UI elements.

### Governance
Rules, policies, and procedures that define how a repository should be managed and maintained.

### Governance Score
A metric (0-100) that measures how well a repository adheres to governance policies and best practices.

---

## H

### Health Score
The primary metric (0-100) that represents the overall health of a repository based on various factors including activity, governance, and technical debt.

### Healdec
The auto-healing engine in AlgoBrainDoctor that automatically detects errors and applies recovery strategies.

### HMR (Hot Module Replacement)
A Vite feature that updates modules in the browser without requiring a full page reload during development.

### Hook
A React function (starting with "use") that lets you use state and other React features in functional components.

---

## I

### Identity
A verified association between a developer and their various accounts or identifiers (GitHub, email, wallet).

### Identity Claim
A request by a user to associate their identity with a repository in a specific role (owner, maintainer, contributor, governor).

### IndexedDB
A browser API for storing large amounts of structured data client-side, used by Spark KV for persistence.

### Ingestion
The process of receiving, validating, and storing data from external sources (e.g., GitHub webhooks).

---

## J

### JSX
JavaScript XML - a syntax extension for JavaScript that allows writing HTML-like code in React components.

---

## K

### KV (Key-Value) Storage
A simple data storage model where data is stored and retrieved using unique keys. Spark KV provides persistent storage.

---

## L

### Log Entry
A record of system activity, including timestamp, severity level, message, and context.

### Linting
The process of analyzing code for potential errors, style violations, and code quality issues.

---

## M

### Memoization
An optimization technique that caches the result of expensive function calls to avoid redundant computations.

### Metadata
Additional structured information about an entity (e.g., repository, event, or claim).

### Modal
A dialog box or popup window that appears on top of the main interface, typically requiring user interaction before returning.

---

## N

### Neon Border
A visual design element in the AuraFX theme featuring glowing, semi-transparent borders around UI components.

---

## O

### Orchestrator
The central system component that coordinates and manages all worker processes.

---

## P

### Persistent Storage
Data storage that remains available even after the browser is closed or the page is refreshed.

### Props (Properties)
Data passed from a parent component to a child component in React.

---

## Q

### Quarantine
A healing strategy where problematic jobs are isolated for manual review rather than being immediately retried.

### Queue
A list of pending jobs waiting to be processed by a worker.

---

## R

### Radial Chart
A circular chart where data is represented as concentric rings or segments radiating from the center.

### React DevTools
Browser extension for debugging React applications by inspecting component hierarchies and state.

### Repository
A version control storage location for code, typically hosted on platforms like GitHub or GitLab.

### Reroute
A healing strategy that redirects a failing job to an alternate worker for processing.

### Retry
A healing strategy that attempts to execute a failed job again, usually with exponential backoff.

---

## S

### Scan
The process of analyzing a repository to gather information about its structure, dependencies, and health.

### Score
A numerical value (0-100) representing the quality or health of a repository or identity in various dimensions.

### Severity
The importance level of an event or issue (info, warning, error, success, critical).

### shadcn/ui
A collection of reusable UI components built with Radix UI and Tailwind CSS.

### SPA (Single-Page Application)
A web application that loads a single HTML page and dynamically updates content without full page reloads.

### Spark KV
A key-value storage system provided by @github/spark for persisting application state.

### SSR (Server-Side Rendering)
Rendering web pages on the server instead of in the browser (not currently used in AlgoBrainDoctor).

### State
Data that can change over time in a React component, managed with useState or useKV hooks.

---

## T

### Tailwind CSS
A utility-first CSS framework that provides pre-built classes for styling HTML elements.

### Timeline
A chronological view of events related to a repository or system activity.

### Toast
A brief notification that appears temporarily on screen to confirm actions or display messages.

### Tree Shaking
A build optimization that removes unused code from the final bundle.

### TypeScript
A superset of JavaScript that adds static typing and compile-time type checking.

---

## U

### UI (User Interface)
The visual elements and controls through which users interact with the application.

### useKV
A React hook that provides persistent key-value storage with an API similar to useState.

### useMemo
A React hook that memoizes expensive computations to improve performance.

---

## V

### Virtual Scrolling
A technique that renders only visible items in a long list, improving performance with large datasets.

### Vite
A modern build tool and development server that provides fast hot module replacement and optimized builds.

### VitalsModal
A modal component that displays detailed health metrics and analytics for a repository.

---

## W

### Web Vitals
A set of metrics (LCP, FID, CLS) that measure user experience quality on websites.

### WebSocket
A protocol for real-time, bidirectional communication between client and server (planned for future versions).

### Worker
An independent background process that handles specific tasks (indexing, scoring, healing, etc.).

### Worker Pool
The collection of all 12 parallel workers that perform various tasks in AlgoBrainDoctor.

### Worker Status
The current operational state of a worker (healthy, degraded, failed).

---

## X

### XSS (Cross-Site Scripting)
A security vulnerability where malicious scripts are injected into trusted websites.

---

## Acronyms

| Acronym | Full Form | Description |
|---------|-----------|-------------|
| **API** | Application Programming Interface | Interface for programmatic access |
| **CDN** | Content Delivery Network | Distributed content delivery system |
| **CI/CD** | Continuous Integration/Continuous Deployment | Automated build and deployment pipeline |
| **CORS** | Cross-Origin Resource Sharing | Browser security feature |
| **CSS** | Cascading Style Sheets | Styling language for web pages |
| **CSP** | Content Security Policy | Security header specification |
| **DOM** | Document Object Model | Programming interface for HTML/XML |
| **GC** | Garbage Collection | Automated memory/data cleanup |
| **HMR** | Hot Module Replacement | Development feature for instant updates |
| **HTML** | HyperText Markup Language | Markup language for web pages |
| **HTTP** | HyperText Transfer Protocol | Web communication protocol |
| **HTTPS** | HTTP Secure | Encrypted HTTP |
| **JSX** | JavaScript XML | React syntax extension |
| **KV** | Key-Value | Storage model type |
| **NPM** | Node Package Manager | JavaScript package manager |
| **PRD** | Product Requirements Document | Product specification |
| **RBAC** | Role-Based Access Control | Security model |
| **SPA** | Single-Page Application | Web app architecture |
| **SSR** | Server-Side Rendering | Rendering strategy |
| **UI** | User Interface | Visual interface |
| **URL** | Uniform Resource Locator | Web address |
| **UX** | User Experience | User interaction quality |
| **XSS** | Cross-Site Scripting | Security vulnerability |

---

## Concepts

### Functional Update
A pattern for updating state where you pass a function that receives the current state and returns the new state, ensuring you always work with the latest value.

**Example:**
```typescript
setState((current) => current + 1)
```

### Stale Closure
A bug where a function captures an old value from an outer scope, leading to unexpected behavior. Fixed by using functional updates or proper dependencies.

### Type Safety
The practice of using explicit types (TypeScript) to catch errors at compile-time rather than runtime.

### Memoization
Caching computed values to avoid recalculation on every render. Implemented with `useMemo`, `useCallback`, and `memo`.

### Component Composition
Building complex UIs by combining simpler components together, a core React principle.

### Declarative Programming
Describing what the UI should look like for any given state, rather than imperatively defining how to update it (React's paradigm).

---

## Related Documentation

- [User Guide](USER_GUIDE.md) - Learn how to use the application
- [Development Guide](DEVELOPMENT.md) - Technical concepts and patterns
- [Architecture](ARCHITECTURE.md) - System design and structure
- [API Reference](API.md) - Detailed type and component documentation

---

**Version:** 4.0.0  
**Last Updated:** 2024-01-28  
**Maintained By:** AlgoBrainDoctor Core Team
