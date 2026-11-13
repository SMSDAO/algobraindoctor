import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AdmissionEntry,
  ReleaseReadinessState,
  Repository,
} from '@/lib/types'
import { computeReleaseReadiness } from '@/services/admissionEngine'
import {
  CheckCircle,
  RocketLaunch,
  ShieldCheck,
  Warning,
  ArrowsLeftRight,
  Wrench,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ReleaseReadinessPanelProps {
  admissions: AdmissionEntry[]
  repositories: Repository[]
  releaseState: ReleaseReadinessState
  onRunAllGatesAndSync: () => Promise<void>
  onCutStableRelease: (notes: string) => void
}

export function ReleaseReadinessPanel({
  admissions,
  repositories,
  releaseState,
  onRunAllGatesAndSync,
  onCutStableRelease,
}: ReleaseReadinessPanelProps) {
  const [notes, setNotes] = useState(
    releaseState.releaseNotes ||
      'First stable v1.0.0 production release: verified 10-domain repair matrix, score-gated admission queue, dev server port 3000 binding, and 2-way GitHub sync.',
  )
  const [preparing, setPreparing] = useState(false)

  const readiness = useMemo(
    () => computeReleaseReadiness(admissions, repositories, releaseState),
    [admissions, repositories, releaseState],
  )

  const handlePrepare = async () => {
    setPreparing(true)
    try {
      await onRunAllGatesAndSync()
    } finally {
      setPreparing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card/60 backdrop-blur-sm p-4 sm:p-5 space-y-4 neon-border-aqua">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <RocketLaunch size={20} className="text-[var(--aura-aqua)]" />
              <h3 className="text-base sm:text-lg font-space font-semibold">
                Production Release Readiness · {releaseState.version}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Validates every admitted repository and PR across scoring gates, 10 repair domains, and 2-way GitHub sync before cutting the first stable release.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs text-muted-foreground">Release Gates Passed</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-[var(--aura-aqua)]">
              {readiness.passedCount}/{readiness.totalCount}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {readiness.checks.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {check.passed ? (
                  <CheckCircle size={17} className="text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <Warning size={17} className="text-[var(--aura-yellow)] mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-medium text-foreground">
                    {check.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{check.description}</div>
                </div>
              </div>
              <div
                className={cn(
                  'font-mono text-xs tabular-nums shrink-0',
                  check.passed ? 'text-emerald-400' : 'text-[var(--aura-yellow)]',
                )}
              >
                {check.metric}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-1">
          <label
            htmlFor="release-notes-input"
            className="text-xs font-medium text-muted-foreground block"
          >
            Release Notes & GitHub Tag Broadcast
          </label>
          <Textarea
            id="release-notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="text-xs font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrepare}
            disabled={preparing || admissions.length === 0}
            className="text-xs whitespace-nowrap"
          >
            <Wrench size={14} className="mr-1.5 text-[var(--aura-yellow)]" />
            <ArrowsLeftRight size={14} className="mr-1.5 text-[var(--aura-violet)]" />
            {preparing ? 'Repairing & Syncing Fleet...' : 'Auto-Clear Gates & Sync All'}
          </Button>

          <Button
            size="sm"
            onClick={() => onCutStableRelease(notes)}
            disabled={!readiness.readyToRelease}
            className="neon-border-aqua glow-aqua text-xs whitespace-nowrap"
          >
            <ShieldCheck size={15} className="mr-1.5" />
            {releaseState.status === 'released'
              ? `Re-verify & Broadcast ${releaseState.version}`
              : `Cut Stable Release ${releaseState.version}`}
          </Button>
        </div>

        {releaseState.status === 'released' && releaseState.releasedAt && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300 flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">
              Stable release {releaseState.version} verified and tagged
            </span>
            <span className="font-mono text-[11px]">
              Commit {releaseState.tagCommitSha} · {new Date(releaseState.releasedAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
