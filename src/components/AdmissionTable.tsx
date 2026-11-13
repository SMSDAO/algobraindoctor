import { useMemo, useState } from 'react'
import {
  AdmissionDecision,
  AdmissionEntry,
  SyncStatus,
} from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowsLeftRight,
  CheckCircle,
  GitBranch,
  GitPullRequest,
  MagnifyingGlass,
  Play,
  Plus,
  ShieldCheck,
  SkipForward,
  Warning,
  Wrench,
  ChatCircleText,
  GitCommit,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AdmissionTableProps {
  entries: AdmissionEntry[]
  onOpenAddModal: () => void
  onSelectEntry: (entry: AdmissionEntry) => void
  onRunEvaluation: (entry: AdmissionEntry, forceRepair?: boolean) => void
  onRunAllScoringGates: () => void
  onSyncEntry: (entry: AdmissionEntry) => void
  onSyncAll: () => void
}

type FilterKey = 'all' | 'repair_needed' | 'skip_healthy' | 'verified_ready' | 'pending_sync'

function getDecisionDisplay(decision: AdmissionDecision) {
  switch (decision) {
    case 'verified_ready':
      return {
        label: 'Verified Ready',
        icon: CheckCircle,
        textColor: 'text-emerald-400',
      }
    case 'skip_healthy':
      return {
        label: 'Healthy · Skipped',
        icon: SkipForward,
        textColor: 'text-[var(--aura-aqua)]',
      }
    case 'repair_needed':
      return {
        label: 'Repair Needed',
        icon: Warning,
        textColor: 'text-[var(--aura-yellow)]',
      }
    case 'repairing':
      return {
        label: 'Repairing',
        icon: Wrench,
        textColor: 'text-[var(--aura-violet)]',
      }
    case 'failed':
      return {
        label: 'Blocked',
        icon: Warning,
        textColor: 'text-[var(--aura-coral)]',
      }
    default:
      return {
        label: 'Pending Eval',
        icon: ShieldCheck,
        textColor: 'text-muted-foreground',
      }
  }
}

function getSyncDisplay(status: SyncStatus) {
  switch (status) {
    case 'synced':
      return { label: '2-Way Synced', color: 'text-emerald-400' }
    case 'pending_push':
      return { label: 'Pending Push', color: 'text-[var(--aura-yellow)]' }
    case 'pending_pull':
      return { label: 'Pending Pull', color: 'text-[var(--aura-aqua)]' }
    case 'conflict':
      return { label: 'Conflict', color: 'text-[var(--aura-coral)]' }
    default:
      return { label: 'Local Only', color: 'text-muted-foreground' }
  }
}

export function AdmissionTable({
  entries,
  onOpenAddModal,
  onSelectEntry,
  onRunEvaluation,
  onRunAllScoringGates,
  onSyncEntry,
  onSyncAll,
}: AdmissionTableProps) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  const counts = useMemo(() => {
    return {
      all: entries.length,
      repair_needed: entries.filter((e) => e.decision === 'repair_needed').length,
      skip_healthy: entries.filter((e) => e.decision === 'skip_healthy').length,
      verified_ready: entries.filter((e) => e.decision === 'verified_ready').length,
      pending_sync: entries.filter((e) => e.syncStatus !== 'synced').length,
    }
  }, [entries])

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'pending_sync'
            ? entry.syncStatus !== 'synced'
            : entry.decision === filter

      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        `${entry.owner}/${entry.repoName}`.toLowerCase().includes(q) ||
        entry.branch.toLowerCase().includes(q) ||
        (entry.prNumber ? `#${entry.prNumber}`.includes(q) : false) ||
        entry.languages.some((l) => l.toLowerCase().includes(q))

      return matchesFilter && matchesSearch
    })
  }, [entries, filter, search])

  const filterButtons: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'repair_needed', label: 'Needs Repair', count: counts.repair_needed },
    { key: 'skip_healthy', label: 'Healthy Skipped', count: counts.skip_healthy },
    { key: 'verified_ready', label: 'Verified', count: counts.verified_ready },
    { key: 'pending_sync', label: 'Sync Queue', count: counts.pending_sync },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-space font-semibold">
            Repair & Release Admission Table
          </h3>
          <p className="text-xs text-muted-foreground">
            Anyone on the dashboard can admit repos or PRs for 10-domain repair, score-gated testing, and 2-way GitHub sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={onRunAllScoringGates}
            disabled={entries.length === 0}
            className="text-xs whitespace-nowrap"
          >
            <Play size={14} className="mr-1.5 text-[var(--aura-aqua)]" />
            Run Scoring Gate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSyncAll}
            disabled={entries.length === 0}
            className="text-xs whitespace-nowrap"
          >
            <ArrowsLeftRight size={14} className="mr-1.5 text-[var(--aura-violet)]" />
            Sync All 2-Way
          </Button>
          <Button
            size="sm"
            onClick={onOpenAddModal}
            className="neon-border-aqua glow-aqua text-xs whitespace-nowrap"
          >
            <Plus size={14} className="mr-1.5" />
            Admit Repo / PR
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border overflow-x-auto">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => setFilter(btn.key)}
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer tabular-nums',
                filter === btn.key
                  ? 'bg-card text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {btn.label} · {btn.count}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <MagnifyingGlass
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by repo, PR, language..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card/40 p-8 text-center space-y-3">
          <GitPullRequest size={36} className="mx-auto text-muted-foreground opacity-60" />
          <div className="space-y-1">
            <div className="text-sm font-space font-semibold">Admission table is empty</div>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Admit any GitHub repository or pull request to evaluate languages, dependencies, workflows, env, dev servers, tests, builds, cloud, and deployments.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onOpenAddModal}
            className="neon-border-aqua glow-aqua text-xs"
          >
            <Plus size={14} className="mr-1.5" />
            Admit First Repo or PR
          </Button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card/40 p-6 text-center text-xs text-muted-foreground">
          No admitted repos or PRs match the active filter.
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm max-h-[520px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm z-10">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs">Target & Branch</TableHead>
                <TableHead className="text-xs text-right">Score / Gate</TableHead>
                <TableHead className="text-xs">Decision</TableHead>
                <TableHead className="text-xs text-right">10-Stage Matrix</TableHead>
                <TableHead className="text-xs">GitHub 2-Way</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const decisionInfo = getDecisionDisplay(entry.decision)
                const DecisionIcon = decisionInfo.icon
                const syncInfo = getSyncDisplay(entry.syncStatus)
                const passedOrFixed = entry.stages.filter(
                  (s) => s.status === 'passed' || s.status === 'fixed' || s.status === 'skipped',
                ).length
                const fixedCount = entry.stages.reduce((sum, s) => sum + s.fixesApplied, 0)

                return (
                  <TableRow
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className="cursor-pointer border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="py-2.5">
                      <div className="flex items-start gap-2 min-w-0">
                        {entry.targetType === 'pr' ? (
                          <GitPullRequest
                            size={16}
                            className="mt-0.5 text-[var(--aura-violet)] shrink-0"
                          />
                        ) : (
                          <GitBranch
                            size={16}
                            className="mt-0.5 text-[var(--aura-aqua)] shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-[240px]">
                            {entry.owner}/{entry.repoName}
                            {entry.prNumber ? ` #${entry.prNumber}` : ''}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                            {entry.branch} · {entry.languages.slice(0, 2).join(', ')} · {entry.submittedByRole}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono tabular-nums py-2.5">
                      <div className="text-xs font-semibold text-foreground">
                        {entry.scores.overall}
                        <span className="text-muted-foreground font-normal">/{entry.scoreThreshold}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {entry.repairOnlyIfNeeded ? 'If needed' : 'Always'}
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className={cn('inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap', decisionInfo.textColor)}>
                        <DecisionIcon size={14} className="shrink-0" />
                        <span>{decisionInfo.label}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right font-mono tabular-nums py-2.5">
                      <div className="text-xs text-foreground">
                        {passedOrFixed}/{entry.stages.length}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {fixedCount > 0 ? `${fixedCount} fixes` : '0 fixes'}
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className={cn('text-xs font-medium whitespace-nowrap', syncInfo.color)}>
                        {syncInfo.label}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono tabular-nums">
                        <span className="inline-flex items-center gap-0.5">
                          <ChatCircleText size={11} />
                          {entry.comments.length}
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <GitCommit size={11} />
                          {entry.pushes.length}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell
                      className="text-right py-2.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRunEvaluation(entry, false)}
                          className="h-7 px-2 text-[11px] whitespace-nowrap"
                          title={
                            entry.decision === 'skip_healthy'
                              ? 'Already healthy above threshold (click to re-evaluate)'
                              : 'Evaluate score & repair if needed'
                          }
                        >
                          <Wrench size={12} className="mr-1 text-[var(--aura-aqua)]" />
                          {entry.decision === 'repair_needed' ? 'Repair' : 'Check'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSyncEntry(entry)}
                          className="h-7 px-2 text-[11px] whitespace-nowrap"
                          title="Run 2-way GitHub sync"
                        >
                          <ArrowsLeftRight size={12} className="text-[var(--aura-violet)]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
