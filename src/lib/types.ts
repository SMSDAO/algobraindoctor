export type WorkerType =
  | 'index'
  | 'identity'
  | 'score'
  | 'ingest'
  | 'sync'
  | 'gc'
  | 'alert'
  | 'export'
  | 'audit'
  | 'repair'
  | 'backfill'
  | 'maintenance'

export type WorkerStatus = 'healthy' | 'degraded' | 'failed'

export type HealdecAction =
  | 'retry'
  | 'reroute'
  | 'quarantine'
  | 'repair_triggered'
  | 'escalate'

export type IdentityClaimType =
  | 'owner'
  | 'maintainer'
  | 'contributor'
  | 'governor'
  | 'other'

export type ClaimStatus = 'pending' | 'verified' | 'rejected' | 'revoked'

export type ScoreType = 'trust' | 'activity' | 'governance_health'

export type RoleType = 'user' | 'admin' | 'developer' | 'validator' | 'analyst'

export interface Worker {
  id: string
  type: WorkerType
  status: WorkerStatus
  lastRun: string
  jobsCompleted: number
  jobsFailed: number
  avgDuration: number
  queueSize: number
}

export interface HealdecLogEntry {
  id: string
  timestamp: string
  workerType: WorkerType
  action: HealdecAction
  reason: string
  jobId: string
  metadata?: Record<string, unknown>
}

export interface Repository {
  id: string
  provider: string
  owner: string
  name: string
  defaultBranch: string
  lastIndexedAt: string
  healthScore: number
  activityScore: number
  governanceScore: number
  claimsCount: number
  frameworks: string[]
}

export interface Identity {
  id: string
  type: string
  handle: string
  displayName: string
  avatarUrl?: string
  verifiedAt?: string
  createdAt: string
}

export interface IdentityClaim {
  id: string
  identityId: string
  repoId: string
  claimType: IdentityClaimType
  status: ClaimStatus
  evidence?: Record<string, unknown>
  createdAt: string
  verifiedAt?: string
  revokedAt?: string
}

export interface Score {
  id: string
  subjectType: 'repo' | 'identity'
  subjectId: string
  scoreType: ScoreType
  value: number
  computedAt: string
  trend?: 'up' | 'down' | 'stable'
}

export type ScanEventType =
  | 'scan_started'
  | 'scan_completed'
  | 'scan_failed'
  | 'repair_applied'
  | 'score_updated'
  | 'claim_verified'
  | 'claim_rejected'
  | 'governance_change'
  | 'framework_detected'
  | 'vulnerability_found'
  | 'dependency_updated'
  | 'health_improved'
  | 'health_degraded'

export interface ScanEvent {
  id: string
  repoId: string
  eventType: ScanEventType
  timestamp: string
  workerType?: WorkerType
  severity: 'info' | 'warning' | 'error' | 'success'
  title: string
  description: string
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

export interface GovernanceEvent {
  id: string
  repoId: string
  eventType: 'policy_change' | 'approval_required' | 'threshold_breach' | 'audit_triggered'
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  actionRequired: boolean
  metadata?: Record<string, unknown>
}

export interface TimelineEvent {
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

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error'
  workerType?: WorkerType
  message: string
  context?: Record<string, unknown>
}
