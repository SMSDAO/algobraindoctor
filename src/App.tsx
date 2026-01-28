import { useKV } from '@github/spark/hooks'
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
import {
  Brain,
  GitBranch,
  Gear,
  ShieldCheck,
  IdentificationCard,
  Plus,
  MagnifyingGlass,
  Database,
  ChartLineUp,
} from '@phosphor-icons/react'
import {
  Repository,
  Worker,
  LogEntry,
  HealdecLogEntry,
  RoleType,
  WorkerType,
  TimelineEvent,
} from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { generateSeedData } from '@/lib/seedData'

function App() {
  const [selectedRole, setSelectedRole] = useKV<RoleType>('selected-role', 'admin')
  const [repositories, setRepositories] = useKV<Repository[]>('repositories', [])
  const [workers, setWorkers] = useKV<Worker[]>('workers', [])
  const [logs, setLogs] = useKV<LogEntry[]>('logs', [])
  const [healdecLogs, setHealdecLogs] = useKV<HealdecLogEntry[]>('healdec-logs', [])
  const [timelineEvents, setTimelineEvents] = useKV<TimelineEvent[]>('timeline-events', [])
  
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false)
  const [healdecModalOpen, setHealdecModalOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

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
    toast.success('Sample data loaded successfully!', {
      description: `${seedData.repositories.length} repos, ${seedData.workers.length} workers, and system logs initialized.`,
    })
  }

  const handleClaimSubmit = (claim: {
    identityType: string
    handle: string
    claimType: string
    evidence: string
  }) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      workerType: 'identity',
      message: `Identity claim submitted: ${claim.handle} as ${claim.claimType}`,
      context: claim,
    }
    setLogs((currentLogs) => [newLog, ...(currentLogs || [])].slice(0, 100))
  }

  const healthyWorkers = (workers || []).filter((w) => w.status === 'healthy').length
  const totalJobs = (workers || []).reduce((sum, w) => sum + w.jobsCompleted, 0)
  const avgHealth = (repositories || []).length > 0
    ? Math.round((repositories || []).reduce((sum, r) => sum + r.healthScore, 0) / (repositories || []).length)
    : 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain size={32} className="text-[var(--aura-violet)] glow-violet" />
              <div>
                <h1 className="text-xl font-space font-bold">AlgoBrainDoctor</h1>
                <div className="text-xs text-muted-foreground font-mono">
                  Social Index & Identity Network v0.1
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="glow-aqua neon-border-aqua">
                  {healthyWorkers}/{(workers || []).length} Workers
                </Badge>
                <Badge variant="outline" className="glow-violet neon-border-violet">
                  {totalJobs} Jobs
                </Badge>
                <Badge variant="outline" className="glow-yellow neon-border-yellow">
                  Avg Health: {avgHealth}
                </Badge>
              </div>

              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as RoleType)}>
                <SelectTrigger className="w-32">
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

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-space font-semibold flex items-center gap-2">
                <GitBranch size={20} />
                Fleet Navigator
              </h2>
              <Badge className="font-mono text-xs">{(repositories || []).length}</Badge>
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
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredRepos.length === 0 && (repositories || []).length === 0 ? (
                <div className="py-12 text-center space-y-4">
                  <Database size={48} className="mx-auto text-muted-foreground opacity-50" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">No repositories indexed yet</p>
                    <Button
                      size="sm"
                      onClick={handleSeedData}
                      className="neon-border-violet glow-violet"
                    >
                      <Database size={16} className="mr-1.5" />
                      Load Sample Data
                    </Button>
                  </div>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No repositories match your search
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <RepoCard
                    key={repo.id}
                    repo={repo}
                    onClick={() => handleRepoClick(repo)}
                    selected={selectedRepo?.id === repo.id}
                  />
                ))
              )}
            </div>

            <Button
              className="w-full neon-border-violet glow-violet"
              onClick={() => setClaimModalOpen(true)}
            >
              <Plus size={18} />
              Submit Identity Claim
            </Button>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="analytics">
                  <ChartLineUp size={16} className="mr-1.5" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="workers">
                  <Gear size={16} className="mr-1.5" />
                  Workers
                </TabsTrigger>
                <TabsTrigger value="healing">
                  <ShieldCheck size={16} className="mr-1.5" />
                  Healdec
                </TabsTrigger>
                <TabsTrigger value="claims">
                  <IdentificationCard size={16} className="mr-1.5" />
                  Claims
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-space font-semibold">Fleet Health Analytics</h3>
                  <Badge variant="outline" className="text-xs">
                    Real-time metrics
                  </Badge>
                </div>
                <FleetHealthCharts repositories={repositories || []} workers={workers || []} />
              </TabsContent>

              <TabsContent value="workers" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-space font-semibold">Worker Pool Status</h3>
                  <Badge variant="outline" className="text-xs">
                    12 Parallel Workers
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(workers || []).map((worker) => (
                    <WorkerCard key={worker.id} worker={worker} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="healing" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-space font-semibold">
                    Auto-Healing Activity
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHealdecModalOpen(true)}
                  >
                    View Full Log
                  </Button>
                </div>
                <div className="space-y-2">
                  {(healdecLogs || []).slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg border border-border bg-card/50 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-muted-foreground">{log.reason}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="claims" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-space font-semibold">Recent Claims</h3>
                  <Button
                    size="sm"
                    onClick={() => setClaimModalOpen(true)}
                    className="neon-border-violet"
                  >
                    <Plus size={16} />
                    New Claim
                  </Button>
                </div>
                <div className="p-8 text-center text-muted-foreground">
                  No identity claims yet. Submit your first claim to get started.
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-lg font-space font-semibold">Live System Log</h2>
            <SmartBrainTerminal logs={logs || []} maxHeight="calc(100vh - 200px)" />
          </div>
        </div>
      </div>

      <VitalsModal
        open={vitalsModalOpen}
        onOpenChange={setVitalsModalOpen}
        repo={selectedRepo}
        timelineEvents={selectedRepoEvents}
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
    </div>
  )
}

export default App
