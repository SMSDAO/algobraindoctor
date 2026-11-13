import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  AdmissionEntry,
  RepairStageStatus,
  RoleType,
} from '@/lib/types'
import {
  ArrowsLeftRight,
  ArrowSquareOut,
  CheckCircle,
  ChatCircleText,
  CloudArrowDown,
  CloudArrowUp,
  GitBranch,
  GitCommit,
  GitPullRequest,
  PaperPlaneRight,
  SkipForward,
  SpinnerGap,
  Trash,
  Warning,
  Wrench,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface AdmissionInspectorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: AdmissionEntry | null
  currentRole: RoleType
  onTogglePolicy: (entryId: string, repairOnlyIfNeeded: boolean) => void
  onRunEvaluation: (entry: AdmissionEntry, forceRepair: boolean) => void
  onPullSync: (entry: AdmissionEntry) => Promise<void>
  onPushRepair: (entry: AdmissionEntry, commitMessage?: string) => void
  onReconcileTwoWay: (entry: AdmissionEntry) => Promise<void>
  onPostComment: (entry: AdmissionEntry, body: string) => void
  onRemoveEntry: (entryId: string) => void
}

function getStageStatusDisplay(status: RepairStageStatus) {
  switch (status) {
    case 'fixed':
      return { label: 'Fixed', color: 'text-emerald-400', icon: Wrench }
    case 'passed':
      return { label: 'Passed', color: 'text-[var(--aura-aqua)]', icon: CheckCircle }
    case 'skipped':
      return { label: 'Skipped (Healthy)', color: 'text-muted-foreground', icon: SkipForward }
    case 'failed':
      return { label: 'Failed', color: 'text-[var(--aura-coral)]', icon: Warning }
    case 'running':
      return { label: 'Running', color: 'text-[var(--aura-violet)]', icon: SpinnerGap }
    default:
      return { label: 'Pending', color: 'text-[var(--aura-yellow)]', icon: Warning }
  }
}

export function AdmissionInspectorModal({
  open,
  onOpenChange,
  entry,
  currentRole,
  onTogglePolicy,
  onRunEvaluation,
  onPullSync,
  onPushRepair,
  onReconcileTwoWay,
  onPostComment,
  onRemoveEntry,
}: AdmissionInspectorModalProps) {
  const [commentBody, setCommentBody] = useState('')
  const [commitMsg, setCommitMsg] = useState('')
  const [syncingAction, setSyncingAction] = useState<'pull' | 'reconcile' | null>(null)

  if (!entry) return null

  const scoreDomains = [
    { label: 'Languages & Types', value: entry.scores.languages },
    { label: 'Dependencies', value: entry.scores.dependencies },
    { label: 'Workflows & CI', value: entry.scores.workflows },
    { label: 'Test Suites', value: entry.scores.tests },
    { label: 'Build & Deploy', value: entry.scores.buildAndDeploy },
    { label: 'Cloud & Env', value: entry.scores.cloudAndEnv },
  ]

  const handlePull = async () => {
    setSyncingAction('pull')
    try {
      await onPullSync(entry)
    } finally {
      setSyncingAction(null)
    }
  }

  const handleReconcile = async () => {
    setSyncingAction('reconcile')
    try {
      await onReconcileTwoWay(entry)
    } finally {
      setSyncingAction(null)
    }
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim()) return
    onPostComment(entry, commentBody.trim())
    setCommentBody('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-md neon-border-violet glow-violet">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-6">
            <div>
              <DialogTitle className="text-base sm:text-xl font-space flex items-center gap-2">
                {entry.targetType === 'pr' ? (
                  <GitPullRequest size={22} className="text-[var(--aura-violet)] shrink-0" />
                ) : (
                  <GitBranch size={22} className="text-[var(--aura-aqua)] shrink-0" />
                )}
                <span className="font-mono truncate">
                  {entry.owner}/{entry.repoName}
                  {entry.prNumber ? ` #${entry.prNumber}` : ''}
                </span>
              </DialogTitle>
              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono">{entry.branch}</span>
                <span aria-hidden="true">·</span>
                <span>{entry.languages.join(', ')}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Score {entry.scores.overall}/{entry.scoreThreshold}
                </span>
                <a
                  href={entry.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--aura-aqua)] hover:underline"
                >
                  GitHub <ArrowSquareOut size={12} />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onRemoveEntry(entry.id)
                  onOpenChange(false)
                }}
                className="text-xs text-[var(--aura-coral)] hover:text-[var(--aura-coral)]"
              >
                <Trash size={14} className="mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="pipeline" className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-auto shrink-0">
            <TabsTrigger value="pipeline" className="text-xs sm:text-sm py-2">
              <Wrench size={14} className="mr-1.5" />
              10-Domain Repair & Scoring
            </TabsTrigger>
            <TabsTrigger value="sync" className="text-xs sm:text-sm py-2">
              <ArrowsLeftRight size={14} className="mr-1.5" />
              GitHub 2-Way Sync ({entry.comments.length + entry.pushes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline" className="flex-1 min-h-0 overflow-y-auto space-y-4 py-3 pr-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="inspector-repair-gate"
                  checked={entry.repairOnlyIfNeeded}
                  onCheckedChange={(checked) => onTogglePolicy(entry.id, checked)}
                />
                <div>
                  <Label htmlFor="inspector-repair-gate" className="text-xs sm:text-sm">
                    Only repair if score &lt; {entry.scoreThreshold}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.scores.overall >= entry.scoreThreshold
                      ? 'Threshold satisfied — conditional evaluation skips mutations.'
                      : 'Below threshold — conditional evaluation triggers full 10-domain repair.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRunEvaluation(entry, false)}
                  className="text-xs whitespace-nowrap"
                >
                  Evaluate Scoring Gate
                </Button>
                <Button
                  size="sm"
                  onClick={() => onRunEvaluation(entry, true)}
                  className="neon-border-aqua glow-aqua text-xs whitespace-nowrap"
                >
                  <Wrench size={14} className="mr-1.5" />
                  Force Full Repair & Test
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {scoreDomains.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border bg-card/50 p-2.5 space-y-1"
                >
                  <div className="text-[11px] text-muted-foreground truncate">{item.label}</div>
                  <div
                    className={cn(
                      'text-lg font-mono font-bold tabular-nums',
                      item.value >= entry.scoreThreshold
                        ? 'text-[var(--aura-aqua)]'
                        : 'text-[var(--aura-yellow)]',
                    )}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-space font-semibold">
                <span>10-Domain Verification & Remediation Matrix</span>
                <span className="font-mono text-muted-foreground tabular-nums">
                  {entry.stages.filter((s) => s.status === 'fixed' || s.status === 'passed').length}/
                  {entry.stages.length} active checks
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {entry.stages.map((stage) => {
                  const statusInfo = getStageStatusDisplay(stage.status)
                  const StatusIcon = statusInfo.icon
                  return (
                    <div
                      key={stage.key}
                      className="rounded-lg border border-border bg-card/40 p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground truncate">
                            {stage.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {stage.category} · <span className="font-mono">{stage.durationMs}ms</span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'inline-flex items-center gap-1 text-[11px] font-medium shrink-0',
                            statusInfo.color,
                          )}
                        >
                          <StatusIcon size={13} />
                          <span>{statusInfo.label}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{stage.summary}</div>
                      {stage.command && (
                        <div className="font-mono text-[10px] text-foreground/80 bg-background/50 border border-border/70 rounded px-2 py-1 truncate">
                          $ {stage.command}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sync" className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 py-3 pr-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 shrink-0">
              <div className="space-y-0.5">
                <div className="text-xs font-space font-semibold flex items-center gap-2">
                  <span>Bidirectional GitHub Synchronization</span>
                  <span className="font-mono text-[11px] text-[var(--aura-aqua)]">
                    [{entry.syncStatus}]
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {entry.lastSyncedAt
                    ? `Last synced: ${new Date(entry.lastSyncedAt).toLocaleString()}`
                    : 'Not yet synced with remote GitHub API'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePull}
                  disabled={syncingAction !== null}
                  className="text-xs whitespace-nowrap"
                >
                  {syncingAction === 'pull' ? (
                    <SpinnerGap size={14} className="mr-1.5 animate-spin" />
                  ) : (
                    <CloudArrowDown size={14} className="mr-1.5 text-[var(--aura-aqua)]" />
                  )}
                  Pull from GitHub
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPushRepair(entry, commitMsg.trim() || undefined)}
                  disabled={syncingAction !== null}
                  className="text-xs whitespace-nowrap"
                >
                  <CloudArrowUp size={14} className="mr-1.5 text-[var(--aura-yellow)]" />
                  Push Repair Branch
                </Button>
                <Button
                  size="sm"
                  onClick={handleReconcile}
                  disabled={syncingAction !== null}
                  className="neon-border-violet glow-violet text-xs whitespace-nowrap"
                >
                  {syncingAction === 'reconcile' ? (
                    <SpinnerGap size={14} className="mr-1.5 animate-spin" />
                  ) : (
                    <ArrowsLeftRight size={14} className="mr-1.5" />
                  )}
                  Reconcile 2-Way
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
              {/* Left: Outbound Push & Commit Ledger */}
              <div className="flex flex-col rounded-lg border border-border bg-card/40 overflow-hidden min-h-[260px]">
                <div className="px-3 py-2 border-b border-border flex items-center justify-between shrink-0">
                  <span className="text-xs font-space font-semibold flex items-center gap-1.5">
                    <GitCommit size={15} className="text-[var(--aura-yellow)]" />
                    Repair Branch Pushes ({entry.pushes.length})
                  </span>
                </div>
                <div className="p-2.5 border-b border-border bg-background/30 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={commitMsg}
                    onChange={(e) => setCommitMsg(e.target.value)}
                    placeholder="Optional custom commit message..."
                    className="flex-1 min-w-0 bg-background border border-border rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      onPushRepair(entry, commitMsg.trim() || undefined)
                      setCommitMsg('')
                    }}
                    className="text-xs whitespace-nowrap shrink-0"
                  >
                    Push Commit
                  </Button>
                </div>
                <div className="flex-1 min-h-0 max-h-[320px] overflow-y-auto p-2.5">
                  <div className="space-y-2">
                    {entry.pushes.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No repair commits pushed yet. Click Push Branch after evaluation.
                      </div>
                    ) : (
                      entry.pushes.map((push) => (
                        <div
                          key={push.id}
                          className="rounded border border-border bg-background/40 p-2.5 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 font-mono">
                            <span className="text-[var(--aura-aqua)] truncate">{push.branch}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {push.commitSha} · {push.delivery}
                            </span>
                          </div>
                          <div className="text-foreground/90">{push.commitMessage}</div>
                          <div className="text-[10px] font-mono text-muted-foreground truncate">
                            Files: {push.filesChanged.join(', ')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right: 2-Way GitHub Comments */}
              <div className="flex flex-col rounded-lg border border-border bg-card/40 overflow-hidden min-h-[260px]">
                <div className="px-3 py-2 border-b border-border flex items-center justify-between shrink-0">
                  <span className="text-xs font-space font-semibold flex items-center gap-1.5">
                    <ChatCircleText size={15} className="text-[var(--aura-aqua)]" />
                    2-Way PR / Repo Comments ({entry.comments.length})
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Role: {currentRole}
                  </span>
                </div>

                <form
                  onSubmit={handleCommentSubmit}
                  className="p-2.5 border-b border-border bg-background/30 space-y-2 shrink-0"
                >
                  <Textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Post a review or repair comment (synced to GitHub thread)..."
                    rows={2}
                    className="text-xs resize-none"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="text-xs whitespace-nowrap">
                      <PaperPlaneRight size={13} className="mr-1.5" />
                      Post & Sync Comment
                    </Button>
                  </div>
                </form>

                <div className="flex-1 min-h-0 max-h-[260px] overflow-y-auto p-2.5">
                  <div className="space-y-2">
                    {entry.comments.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No comments yet. Pull from GitHub or post a comment above.
                      </div>
                    ) : (
                      entry.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded border border-border bg-background/40 p-2.5 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="font-mono font-medium text-foreground">
                              @{comment.author} · {comment.direction} ({comment.role})
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {comment.synced ? 'Synced' : 'Queued'} ·{' '}
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-foreground/90 whitespace-pre-wrap break-words">
                            {comment.body}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
