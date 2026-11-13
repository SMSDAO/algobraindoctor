import { useKV } from '@/hooks/use-kv'
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { RepoCard } from '@/components/RepoCard'
import { WorkerCard } from '@/components/WorkerCard'
import { SmartBrainTerminal } from '@/components/SmartBrainTerminal'
import { VitalsModal } from '@/components/VitalsModal'
import { HealdecModal } from '@/components/HealdecModal'
import { ClaimModal } from '@/components/ClaimModal'
import { FleetHealthCharts } from '@/components/FleetHealthCharts'
import { AdmissionTable } from '@/components/AdmissionTable'
import { AddAdmissionModal } from '@/components/AddAdmissionModal'
import { AdmissionInspectorModal } from '@/components/AdmissionInspectorModal'
import { ReleaseReadinessPanel } from '@/components/ReleaseReadinessPanel'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Brain,
  GitBranch,
  GitPullRequest,
  Gear,
  ShieldCheck,
  IdentificationCard,
  Plus,
  MagnifyingGlass,
  Database,
  ChartLineUp,
  RocketLaunch,
  ListChecks,
} from '@phosphor-icons/react'
import {
  Repository,
  Worker,
  LogEntry,
  HealdecLogEntry,
  RoleType,
  WorkerType,
  TimelineEvent,
  AdmissionEntry,
  ReleaseReadinessState,
  IdentityClaim,
  IdentityClaimType,
} from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { generateSeedData, generateInitialAdmissions } from '@/lib/seedData'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { createSession, ROLE_PERMISSIONS, type Role } from '@/services/auth'
import {
  parseGitHubTarget,
  fetchGitHubSnapshot,
  pullGitHubUpdates,
  addOutboundComment,
  pushRepairBranchSync,
  reconcileTwoWaySync,
  generateCommitSha,
} from '@/services/githubSync'
import {
  buildAdmissionEntry,
  evaluateAndProcessAdmission,
} from '@/services/admissionEngine'

function App() {
  const isMobile = useIsMobile()
  const [selectedRole, setSelectedRole] = useKV<RoleType>('selected-role', 'admin')
  const [repositories, setRepositories] = useKV<Repository[]>('repositories', [])
  const [workers, setWorkers] = useKV<Worker[]>('workers', [])
  const [logs, setLogs] = useKV<LogEntry[]>('logs', [])
  const [healdecLogs, setHealdecLogs] = useKV<HealdecLogEntry[]>('healdec-logs', [])
  const [timelineEvents, setTimelineEvents] = useKV<TimelineEvent[]>('timeline-events', [])
  const [claims, setClaims] = useKV<IdentityClaim[]>('identity-claims', [])
  const [admissions, setAdmissions] = useKV<AdmissionEntry[]>(
    'admissions',
    generateInitialAdmissions(),
  )
  const [releaseState, setReleaseState] = useKV<ReleaseReadinessState>('release-state', {
    version: 'v1.0.0',
    status: 'preparing',
  })

  const [activeTab, setActiveTab] = useState('admission')
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null)
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false)
  const [healdecModalOpen, setHealdecModalOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [addAdmissionOpen, setAddAdmissionOpen] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Sync the auth service session whenever the selected role changes so that
  // permission checks throughout the app stay consistent with the role shown
  // in the header. `createSession` is synchronous — no async race condition.
  useEffect(() => {
    if (selectedRole) {
      createSession('spark-user', 'Spark User', selectedRole as Role)
    }
  }, [selectedRole])

  // Derive permission flags directly from the role (React state) rather than
  // reading from module-level auth state to avoid stale reads.
  const rolePermissions = ROLE_PERMISSIONS[(selectedRole ?? 'user') as Role] ?? []
  const canWriteRepos = rolePermissions.includes('repos:write')
  const canWriteClaims = rolePermissions.includes('claims:write')
  const canAdminClaims = rolePermissions.includes('claims:admin')

  useEffect(() => {
    if ((timelineEvents || []).length === 0 && (repositories || []).length > 0) {
      const mockEvents: TimelineEvent[] = []
      const now = Date.now()
      const repos = repositories || []
      
      repos.forEach((repo, repoIndex) => {
        const eventCount = 8 + Math.floor(Math.random() * 12)
        
        for (let i = 0; i < eventCount; i++) {
          const hoursAgo = Math.random() * 168
          const timestamp = new Date(now - hoursAgo * 3600000).toISOString()
          
          const eventTypes = [
            {
              type: 'scan' as const,
              severity: 'success' as const,
              title: 'Full scan completed',
              description: `Indexed ${Math.floor(Math.random() * 500 + 100)} commits and ${Math.floor(Math.random() * 50 + 10)} PRs`,
              workerType: 'index' as WorkerType,
              metadata: {
                duration: Math.floor(Math.random() * 5000 + 1000),
                oldScore: repo.healthScore - Math.floor(Math.random() * 10),
                newScore: repo.healthScore,
              },
            },
            {
              type: 'governance' as const,
              severity: 'warning' as const,
              title: 'Governance threshold breach detected',
              description: 'Repository activity below minimum threshold for 48 hours',
              workerType: 'audit' as WorkerType,
              metadata: {
                threshold: 75,
                actual: 68,
              },
            },
            {
              type: 'scan' as const,
              severity: 'info' as const,
              title: 'Framework detected',
              description: 'Automatically detected and indexed new framework',
              workerType: 'index' as WorkerType,
              metadata: {
                framework: repo.frameworks[Math.floor(Math.random() * repo.frameworks.length)] || 'React',
              },
            },
            {
              type: 'healing' as const,
              severity: 'success' as const,
              title: 'Auto-healing completed',
              description: 'Repaired stale index records and recomputed scores',
              workerType: 'repair' as WorkerType,
              metadata: {
                recordsRepaired: Math.floor(Math.random() * 20 + 5),
                duration: Math.floor(Math.random() * 2000 + 500),
              },
            },
            {
              type: 'scan' as const,
              severity: 'error' as const,
              title: 'Vulnerability scan found issues',
              description: 'Security vulnerabilities detected in dependencies',
              workerType: 'audit' as WorkerType,
              metadata: {
                issueCount: Math.floor(Math.random() * 5 + 1),
                severity: 'medium',
              },
            },
            {
              type: 'governance' as const,
              severity: 'success' as const,
              title: 'Identity claim verified',
              description: 'New maintainer claim verified and linked',
              workerType: 'identity' as WorkerType,
              metadata: {
                claimType: 'maintainer',
                handle: `user-${Math.floor(Math.random() * 1000)}`,
              },
            },
            {
              type: 'scan' as const,
              severity: 'success' as const,
              title: 'Score updated',
              description: 'Governance health score improved after recent activity',
              workerType: 'score' as WorkerType,
              metadata: {
                oldScore: repo.governanceScore - Math.floor(Math.random() * 15),
                newScore: repo.governanceScore,
              },
            },
            {
              type: 'healing' as const,
              severity: 'warning' as const,
              title: 'Health degradation detected',
              description: 'Multiple failed CI runs detected, triggering monitoring',
              workerType: 'alert' as WorkerType,
              metadata: {
                failedRuns: Math.floor(Math.random() * 5 + 3),
              },
            },
          ]
          
          const eventTemplate = eventTypes[Math.floor(Math.random() * eventTypes.length)]
          
          mockEvents.push({
            id: `event-${repoIndex}-${i}-${Date.now()}`,
            repoId: repo.id,
            timestamp,
            ...eventTemplate,
          })
        }
      })
      
      setTimelineEvents(mockEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
    }
  }, [repositories, timelineEvents, setTimelineEvents])

  const filteredRepos = (repositories || []).filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRepoClick = (repo: Repository) => {
    setSelectedRepo(repo)
    setVitalsModalOpen(true)
  }

  const selectedRepoEvents = selectedRepo
    ? (timelineEvents || []).filter((event) => event.repoId === selectedRepo.id)
    : []

  const handleSeedData = () => {
    const seedData = generateSeedData()
    setRepositories(seedData.repositories)
    setWorkers(seedData.workers)
    setHealdecLogs(seedData.healdecLogs)
    setLogs(seedData.logs)
    if ((admissions || []).length === 0) {
      setAdmissions(generateInitialAdmissions())
    }
    toast.success('Sample data loaded successfully!', {
      description: `${seedData.repositories.length} repos, ${seedData.workers.length} workers, and system logs initialized.`,
    })
  }

  const appendSystemLog = (entry: LogEntry) => {
    setLogs((currentLogs) => [entry, ...(currentLogs || [])].slice(0, 100))
  }

  const syncAdmissionToFleet = (entry: AdmissionEntry) => {
    const now = new Date().toISOString()
    setRepositories((currentRepos) => {
      const list = currentRepos || []
      const idx = list.findIndex(
        (r) =>
          r.owner.toLowerCase() === entry.owner.toLowerCase() &&
          r.name.toLowerCase() === entry.repoName.toLowerCase(),
      )
      if (idx >= 0) {
        const updated = [...list]
        updated[idx] = {
          ...updated[idx],
          healthScore: Math.max(updated[idx].healthScore, entry.scores.overall),
          governanceScore: Math.max(updated[idx].governanceScore, entry.scores.workflows),
          lastIndexedAt: now,
          frameworks:
            entry.languages.length > 0 ? entry.languages : updated[idx].frameworks,
        }
        return updated
      }
      const newRepo: Repository = {
        id: `repo-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        provider: 'github',
        owner: entry.owner,
        name: entry.repoName,
        defaultBranch: entry.remoteDefaultBranch || entry.branch || 'main',
        lastIndexedAt: now,
        healthScore: entry.scores.overall,
        activityScore: entry.scores.tests,
        governanceScore: entry.scores.workflows,
        claimsCount: 1,
        frameworks: entry.languages.length > 0 ? entry.languages : ['TypeScript'],
      }
      return [newRepo, ...list]
    })
  }

  const handleAdmitTarget = async (params: {
    targetInput: string
    branchOverride?: string
    scoreThreshold: number
    repairOnlyIfNeeded: boolean
    twoWaySyncEnabled: boolean
    autoEvaluate: boolean
  }) => {
    const parsed = parseGitHubTarget(params.targetInput, params.branchOverride || 'main')
    if (params.branchOverride) {
      parsed.branch = params.branchOverride
    }

    const snapshot = await fetchGitHubSnapshot(parsed)
    let entry = buildAdmissionEntry({
      target: parsed,
      snapshot,
      submittedByRole: (selectedRole ?? 'user') as RoleType,
      scoreThreshold: params.scoreThreshold,
      repairOnlyIfNeeded: params.repairOnlyIfNeeded,
      twoWaySyncEnabled: params.twoWaySyncEnabled,
    })

    if (params.autoEvaluate) {
      const evalRes = evaluateAndProcessAdmission(entry)
      entry = evalRes.updated
      if (evalRes.healdecLog) {
        setHealdecLogs((prev) => [evalRes.healdecLog!, ...(prev || [])].slice(0, 100))
      }
      appendSystemLog(evalRes.systemLog)
    } else {
      appendSystemLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        level: 'info',
        workerType: 'ingest',
        message: `Admitted ${entry.owner}/${entry.repoName}${entry.prNumber ? `#${entry.prNumber}` : ''} (score ${entry.scores.overall}/${entry.scoreThreshold})`,
        context: { role: selectedRole, targetType: entry.targetType },
      })
    }

    setAdmissions((prev) => [entry, ...(prev || [])])
    syncAdmissionToFleet(entry)
    setActiveTab('admission')
    toast.success(
      `${entry.owner}/${entry.repoName}${entry.prNumber ? `#${entry.prNumber}` : ''} admitted`,
      {
        description:
          entry.decision === 'skip_healthy'
            ? `Score ${entry.scores.overall} ≥ ${entry.scoreThreshold} — skipped repair.`
            : entry.decision === 'verified_ready'
              ? `Repaired & verified (${entry.scores.overall}/100).`
              : `Queued for repair (score ${entry.scores.overall} < ${entry.scoreThreshold}).`,
      },
    )
  }

  const handleAdmitFromFleetRepo = async (repo: Repository) => {
    await handleAdmitTarget({
      targetInput: `${repo.owner}/${repo.name}`,
      branchOverride: repo.defaultBranch,
      scoreThreshold: 85,
      repairOnlyIfNeeded: true,
      twoWaySyncEnabled: true,
      autoEvaluate: true,
    })
  }

  const handleRunEvaluation = (entry: AdmissionEntry, forceRepair = false) => {
    const result = evaluateAndProcessAdmission(entry, { forceRepair })
    setAdmissions((prev) =>
      (prev || []).map((item) => (item.id === entry.id ? result.updated : item)),
    )
    if (result.healdecLog) {
      setHealdecLogs((prev) => [result.healdecLog!, ...(prev || [])].slice(0, 100))
    }
    appendSystemLog(result.systemLog)
    syncAdmissionToFleet(result.updated)

    if (result.didRepair) {
      toast.success(`Repaired & verified ${entry.owner}/${entry.repoName}`, {
        description: `Score improved to ${result.updated.scores.overall}/100 across all 10 stages.`,
      })
    } else {
      toast.info(`Skipped repair for ${entry.owner}/${entry.repoName}`, {
        description: `Score ${entry.scores.overall} already meets threshold ${entry.scoreThreshold}.`,
      })
    }
  }

  const handleRunAllScoringGates = () => {
    const current = admissions || []
    if (current.length === 0) return
    let repairedCount = 0
    let skippedCount = 0
    const nextHealdec: HealdecLogEntry[] = []
    const nextLogs: LogEntry[] = []

    const nextAdmissions = current.map((entry) => {
      const res = evaluateAndProcessAdmission(entry)
      if (res.didRepair) repairedCount++
      else skippedCount++
      if (res.healdecLog) nextHealdec.push(res.healdecLog)
      nextLogs.push(res.systemLog)
      syncAdmissionToFleet(res.updated)
      return res.updated
    })

    setAdmissions(nextAdmissions)
    if (nextHealdec.length > 0) {
      setHealdecLogs((prev) => [...nextHealdec, ...(prev || [])].slice(0, 100))
    }
    setLogs((prev) => [...nextLogs, ...(prev || [])].slice(0, 100))
    toast.success('Scoring gate completed across admission queue', {
      description: `${repairedCount} repaired & verified · ${skippedCount} healthy skipped.`,
    })
  }

  const handleToggleRepairPolicy = (entryId: string, repairOnlyIfNeeded: boolean) => {
    setAdmissions((prev) =>
      (prev || []).map((item) =>
        item.id === entryId
          ? { ...item, repairOnlyIfNeeded, updatedAt: new Date().toISOString() }
          : item,
      ),
    )
  }

  const handlePullSync = async (entry: AdmissionEntry) => {
    const res = await pullGitHubUpdates(entry)
    setAdmissions((prev) =>
      (prev || []).map((item) => (item.id === entry.id ? res.updated : item)),
    )
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      workerType: 'sync',
      message: `GitHub inbound pull for ${entry.owner}/${entry.repoName}: ${res.pulledComments} new comment(s)`,
      context: { fetchedFromApi: res.fetchedFromApi },
    })
    toast.success('Pulled updates from GitHub', {
      description: res.fetchedFromApi
        ? `Live metadata & ${res.pulledComments} new comment(s) synced.`
        : 'GitHub API offline/rate-limited — local state preserved.',
    })
  }

  const handlePushRepair = (entry: AdmissionEntry, commitMessage?: string) => {
    const updated = pushRepairBranchSync(entry, {
      commitMessage,
      postSummaryComment: true,
      author: 'spark-user',
      role: (selectedRole ?? 'user') as RoleType,
    })
    setAdmissions((prev) =>
      (prev || []).map((item) => (item.id === entry.id ? updated : item)),
    )
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      workerType: 'sync',
      message: `Pushed repair branch ${updated.pushes[0]?.branch} (${updated.pushes[0]?.commitSha}) for ${entry.owner}/${entry.repoName}`,
      context: { files: updated.pushes[0]?.filesChanged },
    })
    toast.success('Repair branch & summary comment pushed', {
      description: `${updated.pushes[0]?.branch} · ${updated.pushes[0]?.commitSha}`,
    })
  }

  const handleReconcileTwoWay = async (entry: AdmissionEntry) => {
    const res = await reconcileTwoWaySync(entry)
    setAdmissions((prev) =>
      (prev || []).map((item) => (item.id === entry.id ? res.updated : item)),
    )
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      workerType: 'sync',
      message: `2-way GitHub sync reconciled for ${entry.owner}/${entry.repoName} (pulled ${res.pulledComments}, flushed ${res.flushedItems})`,
    })
    toast.success('2-way GitHub sync reconciled', {
      description: `Pulled ${res.pulledComments} comment(s), flushed ${res.flushedItems} outbound item(s).`,
    })
  }

  const handleSyncAll = async () => {
    const current = admissions || []
    if (current.length === 0) return
    const results = await Promise.all(current.map((entry) => reconcileTwoWaySync(entry)))
    setAdmissions(results.map((r) => r.updated))
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      workerType: 'sync',
      message: `Completed 2-way GitHub sync across ${results.length} admitted targets`,
    })
    toast.success(`Synced ${results.length} targets with GitHub 2-way`)
  }

  const handlePostComment = (entry: AdmissionEntry, body: string) => {
    const updated = addOutboundComment(
      entry,
      body,
      'spark-user',
      (selectedRole ?? 'user') as RoleType,
    )
    setAdmissions((prev) =>
      (prev || []).map((item) => (item.id === entry.id ? updated : item)),
    )
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      workerType: 'sync',
      message: `Posted comment on ${entry.owner}/${entry.repoName}${entry.prNumber ? `#${entry.prNumber}` : ''}`,
      context: { role: selectedRole, synced: updated.twoWaySyncEnabled },
    })
    toast.success('Comment added to 2-way GitHub sync thread')
  }

  const handleRemoveAdmission = (entryId: string) => {
    setAdmissions((prev) => (prev || []).filter((item) => item.id !== entryId))
    if (selectedAdmissionId === entryId) {
      setSelectedAdmissionId(null)
    }
    toast.info('Removed entry from admission queue')
  }

  const handleRunAllGatesAndSync = async () => {
    const current = admissions || []
    const evaluated = current.map((entry) => {
      const res = evaluateAndProcessAdmission(entry)
      if (res.healdecLog) {
        setHealdecLogs((prev) => [res.healdecLog!, ...(prev || [])].slice(0, 100))
      }
      return res.updated
    })
    const synced = await Promise.all(
      evaluated.map(async (entry) => {
        const withPush =
          entry.decision === 'verified_ready' && entry.pushes.length === 0
            ? pushRepairBranchSync(entry, { postSummaryComment: true })
            : entry
        const reconciled = await reconcileTwoWaySync(withPush)
        syncAdmissionToFleet(reconciled.updated)
        return reconciled.updated
      }),
    )
    setAdmissions(synced)
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      workerType: 'maintenance',
      message: `Cleared scoring gates and 2-way GitHub sync for ${synced.length} release targets`,
    })
    toast.success('All admission gates & 2-way syncs cleared for release')
  }

  const handleCutStableRelease = (notes: string) => {
    const now = new Date().toISOString()
    const tagCommitSha = generateCommitSha(`release-v1.0.0:${now}`)
    setReleaseState({
      version: 'v1.0.0',
      status: 'released',
      releasedAt: now,
      releaseNotes: notes,
      tagCommitSha,
    })
    setAdmissions((prev) =>
      (prev || []).map((entry) =>
        addOutboundComment(
          { ...entry, releaseCandidateTag: 'v1.0.0' },
          `[Release v1.0.0 · ${tagCommitSha}] ${notes}`,
          'release-bot',
          (selectedRole ?? 'admin') as RoleType,
        ),
      ),
    )
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: now,
      level: 'info',
      workerType: 'export',
      message: `Cut first stable production release v1.0.0 (tag commit ${tagCommitSha})`,
      context: { admittedCount: (admissions || []).length },
    })
    toast.success('First stable release v1.0.0 tagged & broadcast!')
  }

  const handleWorkerClick = (worker: Worker) => {
    const now = new Date().toISOString()
    const wasUnhealthy = worker.status !== 'healthy'
    setWorkers((currentWorkers) =>
      (currentWorkers || []).map((w) =>
        w.id === worker.id
          ? {
              ...w,
              status: 'healthy',
              lastRun: now,
              jobsCompleted: w.jobsCompleted + 1,
              queueSize: Math.max(0, w.queueSize - 1),
            }
          : w,
      ),
    )

    if (wasUnhealthy) {
      const healEntry: HealdecLogEntry = {
        id: `heal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: now,
        workerType: worker.type,
        action: 'repair_triggered',
        reason: `Manual worker recovery executed for ${worker.type} worker (was ${worker.status})`,
        jobId: `job-${Date.now().toString(36)}`,
      }
      setHealdecLogs((prev) => [healEntry, ...(prev || [])].slice(0, 100))
      toast.success(`Recovered ${worker.type} worker to healthy state`)
    } else {
      toast.success(`${worker.type} worker heartbeat verified`, {
        description: `Queue depth: ${Math.max(0, worker.queueSize - 1)} · Avg ${worker.avgDuration}ms`,
      })
    }

    appendSystemLog({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      timestamp: now,
      level: 'info',
      workerType: worker.type,
      message: wasUnhealthy
        ? `Healdec recovered ${worker.type} worker from ${worker.status} -> healthy`
        : `Dispatched live pulse check on ${worker.type} worker`,
    })
  }

  const handleHealDegradedWorkers = () => {
    const current = workers || []
    const unhealthy = current.filter((w) => w.status !== 'healthy')
    if (unhealthy.length === 0) {
      toast.info('All active workers are already healthy')
      return
    }
    const now = new Date().toISOString()
    setWorkers(
      current.map((w) =>
        w.status !== 'healthy'
          ? { ...w, status: 'healthy', lastRun: now, queueSize: Math.max(0, w.queueSize - 1) }
          : w,
      ),
    )
    const entries: HealdecLogEntry[] = unhealthy.map((w, idx) => ({
      id: `heal-${Date.now()}-${idx}`,
      timestamp: now,
      workerType: w.type,
      action: 'repair_triggered',
      reason: `Fleet-wide Healdec recovery restored ${w.type} worker from ${w.status} to healthy`,
      jobId: `fleet-heal-${Date.now().toString(36)}-${idx}`,
    }))
    setHealdecLogs((prev) => [...entries, ...(prev || [])].slice(0, 100))
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: now,
      level: 'info',
      workerType: 'maintenance',
      message: `Healdec fleet pass restored ${unhealthy.length} worker(s) to healthy`,
    })
    toast.success(`Restored ${unhealthy.length} worker(s) via Healdec`)
  }

  const handleClaimSubmit = (claim: {
    identityType: string
    handle: string
    claimType: IdentityClaimType
    evidence: string
  }) => {
    const now = new Date().toISOString()
    const newClaim: IdentityClaim = {
      id: `claim-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      identityId: `${claim.identityType}:${claim.handle}`,
      repoId: selectedRepo
        ? `${selectedRepo.owner}/${selectedRepo.name}`
        : (repositories || [])[0]
          ? `${(repositories || [])[0].owner}/${(repositories || [])[0].name}`
          : 'SMSDAO/algobraindoctor',
      claimType: claim.claimType,
      status: 'pending',
      evidence: claim.evidence ? { note: claim.evidence, provider: claim.identityType } : undefined,
      createdAt: now,
    }
    setClaims((prev) => [newClaim, ...(prev || [])])

    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: now,
      level: 'info',
      workerType: 'identity',
      message: `Identity claim submitted: ${claim.handle} as ${claim.claimType}`,
      context: claim,
    }
    setLogs((currentLogs) => [newLog, ...(currentLogs || [])].slice(0, 100))
  }

  const handleUpdateClaimStatus = (claimId: string, nextStatus: 'verified' | 'rejected') => {
    const now = new Date().toISOString()
    setClaims((prev) =>
      (prev || []).map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: nextStatus,
              verifiedAt: nextStatus === 'verified' ? now : undefined,
            }
          : c,
      ),
    )
    appendSystemLog({
      id: `log-${Date.now()}`,
      timestamp: now,
      level: nextStatus === 'verified' ? 'info' : 'warn',
      workerType: 'identity',
      message: `Claim ${claimId.slice(0, 14)} marked as ${nextStatus}`,
    })
    toast.success(`Identity claim ${nextStatus}`)
  }

  const healthyWorkers = (workers || []).filter((w) => w.status === 'healthy').length
  const avgHealth = (repositories || []).length > 0
    ? Math.round((repositories || []).reduce((sum, r) => sum + r.healthScore, 0) / (repositories || []).length)
    : 0

  const selectedAdmission =
    (admissions || []).find((a) => a.id === selectedAdmissionId) ?? null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Brain size={28} className="text-[var(--aura-violet)] glow-violet flex-shrink-0 sm:w-8 sm:h-8" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-space font-bold truncate">AlgoBrainDoctor</h1>
                <div className="text-[10px] sm:text-xs text-muted-foreground font-mono hidden sm:block">
                  Social Index, Repair Admission & 2-Way GitHub Sync · {releaseState?.version ?? 'v1.0.0'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-2 text-sm">
                <Badge variant="outline" className="glow-aqua neon-border-aqua text-xs tabular-nums">
                  {healthyWorkers}/{(workers || []).length} Workers
                </Badge>
                <Badge variant="outline" className="glow-violet neon-border-violet text-xs tabular-nums">
                  {(admissions || []).length} Admitted
                </Badge>
                <Badge variant="outline" className="glow-yellow neon-border-yellow text-xs tabular-nums">
                  Avg Health: {avgHealth}
                </Badge>
              </div>

              <Button
                size="sm"
                onClick={() => setAddAdmissionOpen(true)}
                className="neon-border-aqua glow-aqua text-xs whitespace-nowrap"
              >
                <Plus size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">Admit Repo / PR</span>
              </Button>

              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleType)}>
                <SelectTrigger className="w-24 sm:w-32 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="validator">Validator</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-space font-semibold flex items-center gap-2">
                <GitBranch size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Fleet Navigator</span>
                <span className="sm:hidden">Fleet</span>
              </h2>
              <Badge className="font-mono text-xs tabular-nums">{(repositories || []).length}</Badge>
            </div>

            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search repos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            <div className="space-y-2 max-h-[340px] lg:max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
              {filteredRepos.length === 0 && (repositories || []).length === 0 ? (
                <div className="py-8 sm:py-10 text-center space-y-3 sm:space-y-4">
                  <Database size={40} className="sm:w-12 sm:h-12 mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">No repositories indexed yet</p>
                    <div className="flex flex-col gap-2 items-center">
                      <Button
                        size="sm"
                        onClick={() => setAddAdmissionOpen(true)}
                        className="neon-border-aqua glow-aqua text-xs sm:text-sm"
                      >
                        <GitPullRequest size={14} className="mr-1.5" />
                        Add Repo or PR
                      </Button>
                      {canWriteRepos ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSeedData}
                          className="text-xs sm:text-sm"
                        >
                          <Database size={14} className="sm:w-4 sm:h-4 mr-1.5" />
                          Load Sample Data
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Anyone can admit repos/PRs above
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="py-6 sm:py-8 text-center text-muted-foreground text-xs sm:text-sm">
                  No repositories match your search
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    onClick={() => handleRepoClick(repo)}
                    onAdmit={handleAdmitFromFleetRepo}
                    selected={selectedRepo?.id === repo.id}
                  />
                ))
              )}
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full neon-border-aqua text-xs sm:text-sm"
                onClick={() => setAddAdmissionOpen(true)}
              >
                <GitPullRequest size={16} className="mr-1.5 text-[var(--aura-aqua)]" />
                Admit Repo / PR to Repair
              </Button>
              {!isMobile && canWriteClaims && (
                <Button
                  className="w-full neon-border-violet glow-violet text-xs sm:text-sm"
                  onClick={() => setClaimModalOpen(true)}
                >
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                  Submit Identity Claim
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 h-auto">
                <TabsTrigger value="admission" className="text-[11px] sm:text-xs py-2 px-1">
                  <ListChecks size={14} className="sm:mr-1 shrink-0" />
                  <span className="hidden sm:inline truncate">Admission</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-[11px] sm:text-xs py-2 px-1">
                  <ChartLineUp size={14} className="sm:mr-1 shrink-0" />
                  <span className="hidden sm:inline truncate">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="workers" className="text-[11px] sm:text-xs py-2 px-1">
                  <Gear size={14} className="sm:mr-1 shrink-0" />
                  <span className="hidden sm:inline truncate">Workers</span>
                </TabsTrigger>
                <TabsTrigger value="healing" className="text-[11px] sm:text-xs py-2 px-1">
                  <ShieldCheck size={14} className="sm:mr-1 shrink-0" />
                  <span className="hidden sm:inline truncate">Healdec</span>
                </TabsTrigger>
                <TabsTrigger value="claims" className="text-[11px] sm:text-xs py-2 px-1">
                  <IdentificationCard size={14} className="sm:mr-1 shrink-0" />
                  <span className="hidden sm:inline truncate">Claims</span>
                </TabsTrigger>
                <TabsTrigger value="release" className="text-[11px] sm:text-xs py-2 px-1">
                  <RocketLaunch size={14} className="sm:mr-1 shrink-0" />
                  <span className="hidden sm:inline truncate">Release</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="admission" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <AdmissionTable
                  entries={admissions || []}
                  onOpenAddModal={() => setAddAdmissionOpen(true)}
                  onSelectEntry={(entry) => {
                    setSelectedAdmissionId(entry.id)
                    setInspectorOpen(true)
                  }}
                  onRunEvaluation={handleRunEvaluation}
                  onRunAllScoringGates={handleRunAllScoringGates}
                  onSyncEntry={handleReconcileTwoWay}
                  onSyncAll={handleSyncAll}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-space font-semibold">Fleet Health Analytics</h3>
                  <div className="flex items-center gap-2">
                    {(repositories || []).length === 0 && (
                      <Button size="sm" variant="outline" onClick={handleSeedData} className="h-7 text-xs">
                        <Database size={13} className="mr-1" />
                        Load Sample Fleet
                      </Button>
                    )}
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      Real-time metrics
                    </Badge>
                  </div>
                </div>
                <FleetHealthCharts repositories={repositories || []} workers={workers || []} />
              </TabsContent>

              <TabsContent value="workers" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-space font-semibold">Worker Pool Status</h3>
                  <div className="flex items-center gap-2">
                    {(workers || []).some((w) => w.status !== 'healthy') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleHealDegradedWorkers}
                        className="h-7 text-xs neon-border-aqua"
                      >
                        <ShieldCheck size={13} className="mr-1 text-[var(--aura-aqua)]" />
                        Heal Unhealthy
                      </Button>
                    )}
                    <Badge variant="outline" className="text-[10px] sm:text-xs tabular-nums">
                      {(workers || []).length} Parallel Workers
                    </Badge>
                  </div>
                </div>
                {(workers || []).length === 0 ? (
                  <div className="p-6 sm:p-8 text-center rounded-lg border border-dashed border-border bg-card/40 space-y-3">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      No telemetry workers initialized yet. Load the sample fleet to inspect live worker pools.
                    </p>
                    <Button size="sm" variant="outline" onClick={handleSeedData} className="text-xs">
                      <Database size={14} className="mr-1.5" />
                      Initialize 12 Workers
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {(workers || []).map((worker) => (
                      <WorkerCard
                        key={worker.id}
                        worker={worker}
                        onClick={() => handleWorkerClick(worker)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="healing" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-space font-semibold">
                    Auto-Healing Activity
                  </h3>
                  <div className="flex items-center gap-2">
                    {(workers || []).some((w) => w.status !== 'healthy') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleHealDegradedWorkers}
                        className="text-xs neon-border-aqua"
                      >
                        <ShieldCheck size={13} className="mr-1 text-[var(--aura-aqua)]" />
                        Heal Degraded Workers
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setHealdecModalOpen(true)}
                      className="text-xs"
                    >
                      View Full Log
                    </Button>
                  </div>
                </div>
                {(healdecLogs || []).length === 0 ? (
                  <div className="p-6 sm:p-8 text-center rounded-lg border border-dashed border-border bg-card/40 space-y-3">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      No Healdec recovery events recorded yet. Trigger a repair gate or load sample fleet telemetry.
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRunAllScoringGates}
                        className="text-xs neon-border-aqua"
                      >
                        Run Admission Gates
                      </Button>
                      {(workers || []).length === 0 && (
                        <Button size="sm" variant="outline" onClick={handleSeedData} className="text-xs">
                          <Database size={14} className="mr-1.5" />
                          Load Sample Data
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {(healdecLogs || []).slice(0, 10).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 sm:p-3 rounded-lg border border-border bg-card/50 text-xs sm:text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {log.action} · {log.workerType}
                          </Badge>
                          <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-muted-foreground">{log.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="claims" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-space font-semibold">
                    Identity Claims ({(claims || []).length})
                  </h3>
                  {canWriteClaims && (
                    <Button
                      size="sm"
                      onClick={() => setClaimModalOpen(true)}
                      className="neon-border-violet text-xs"
                    >
                      <Plus size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline ml-1">New Claim</span>
                    </Button>
                  )}
                </div>
                {(claims || []).length === 0 ? (
                  <div className="p-6 sm:p-8 text-center rounded-lg border border-dashed border-border bg-card/40 space-y-3">
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      No identity claims yet. Submit your first claim to get started.
                    </p>
                    {canWriteClaims && (
                      <Button
                        size="sm"
                        onClick={() => setClaimModalOpen(true)}
                        className="neon-border-violet text-xs"
                      >
                        <Plus size={14} className="mr-1" />
                        Submit Identity Claim
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                    {(claims || []).map((claim) => (
                      <div
                        key={claim.id}
                        className="p-3 rounded-lg border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-semibold text-foreground truncate">
                              {claim.identityId}
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {claim.claimType}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                claim.status === 'verified'
                                  ? 'text-[10px] text-[var(--aura-aqua)] border-[var(--aura-aqua)]/40'
                                  : claim.status === 'rejected'
                                    ? 'text-[10px] text-[var(--aura-coral)] border-[var(--aura-coral)]/40'
                                    : 'text-[10px] text-[var(--aura-yellow)] border-[var(--aura-yellow)]/40'
                              }
                            >
                              {claim.status}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono truncate">
                            Repo: {claim.repoId} · {new Date(claim.createdAt).toLocaleString()}
                          </div>
                          {typeof claim.evidence?.note === 'string' && claim.evidence.note && (
                            <p className="text-xs text-muted-foreground break-words">
                              {claim.evidence.note}
                            </p>
                          )}
                        </div>
                        {canAdminClaims && claim.status === 'pending' && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateClaimStatus(claim.id, 'verified')}
                              className="h-7 text-[11px] neon-border-aqua"
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateClaimStatus(claim.id, 'rejected')}
                              className="h-7 text-[11px] text-[var(--aura-coral)]"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="release" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                <ReleaseReadinessPanel
                  admissions={admissions || []}
                  repositories={repositories || []}
                  releaseState={
                    releaseState || { version: 'v1.0.0', status: 'preparing' }
                  }
                  onRunAllGatesAndSync={handleRunAllGatesAndSync}
                  onCutStableRelease={handleCutStableRelease}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-3 space-y-3 sm:space-y-4">
            <h2 className="text-base sm:text-lg font-space font-semibold">Live System Log</h2>
            <SmartBrainTerminal
              logs={logs || []}
              maxHeight={isMobile ? '320px' : 'calc(100vh - 200px)'}
            />
          </div>
        </div>
      </div>

      <VitalsModal
        open={vitalsModalOpen}
        onOpenChange={setVitalsModalOpen}
        repo={selectedRepo}
        timelineEvents={selectedRepoEvents}
        onAdmitRepo={handleAdmitFromFleetRepo}
      />
      <HealdecModal
        open={healdecModalOpen}
        onOpenChange={setHealdecModalOpen}
        logs={healdecLogs || []}
      />
      <ClaimModal
        open={claimModalOpen}
        onOpenChange={setClaimModalOpen}
        onSubmit={handleClaimSubmit}
      />
      <AddAdmissionModal
        open={addAdmissionOpen}
        onOpenChange={setAddAdmissionOpen}
        currentRole={(selectedRole ?? 'user') as RoleType}
        fleetRepos={repositories || []}
        onAdmit={handleAdmitTarget}
      />
      <AdmissionInspectorModal
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        entry={selectedAdmission}
        currentRole={(selectedRole ?? 'user') as RoleType}
        onTogglePolicy={handleToggleRepairPolicy}
        onRunEvaluation={handleRunEvaluation}
        onPullSync={handlePullSync}
        onPushRepair={handlePushRepair}
        onReconcileTwoWay={handleReconcileTwoWay}
        onPostComment={handlePostComment}
        onRemoveEntry={handleRemoveAdmission}
      />

      {isMobile && canWriteClaims && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              onClick={() => setClaimModalOpen(true)}
              className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg neon-border-violet glow-violet p-0 z-50 hover:scale-110 transition-transform duration-200"
              aria-label="Submit identity claim"
            >
              <IdentificationCard size={24} weight="duotone" />
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            side="left" 
            sideOffset={8}
            className="bg-[var(--aura-violet)] text-white border-none font-medium shadow-lg"
          >
            Submit Identity Claim
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

export default App
