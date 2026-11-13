import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  GitBranch,
  GitPullRequest,
  ArrowsLeftRight,
  Wrench,
  SpinnerGap,
} from '@phosphor-icons/react'
import { Repository, RoleType } from '@/lib/types'
import { toast } from 'sonner'

interface AddAdmissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRole: RoleType
  fleetRepos: Repository[]
  onAdmit: (params: {
    targetInput: string
    branchOverride?: string
    scoreThreshold: number
    repairOnlyIfNeeded: boolean
    twoWaySyncEnabled: boolean
    autoEvaluate: boolean
  }) => Promise<void>
}

export function AddAdmissionModal({
  open,
  onOpenChange,
  currentRole,
  fleetRepos,
  onAdmit,
}: AddAdmissionModalProps) {
  const [targetInput, setTargetInput] = useState('')
  const [branchOverride, setBranchOverride] = useState('')
  const [scoreThreshold, setScoreThreshold] = useState(85)
  const [repairOnlyIfNeeded, setRepairOnlyIfNeeded] = useState(true)
  const [twoWaySyncEnabled, setTwoWaySyncEnabled] = useState(true)
  const [autoEvaluate, setAutoEvaluate] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetInput.trim()) {
      toast.error('Enter a GitHub repository or pull request')
      return
    }

    setSubmitting(true)
    try {
      await onAdmit({
        targetInput: targetInput.trim(),
        branchOverride: branchOverride.trim() || undefined,
        scoreThreshold,
        repairOnlyIfNeeded,
        twoWaySyncEnabled,
        autoEvaluate,
      })
      setTargetInput('')
      setBranchOverride('')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to admit target')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-md neon-border-aqua glow-aqua">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-space flex items-center gap-2">
            <GitPullRequest size={22} className="text-[var(--aura-aqua)]" />
            Admit Repository or PR to Repair Queue
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Open to all dashboard roles (active: <span className="font-mono text-foreground">{currentRole}</span>). Runs 10-domain verification, scoring-gated repair, and 2-way GitHub sync.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="admission-target" className="text-xs sm:text-sm">
              GitHub Repository or Pull Request
            </Label>
            <Input
              id="admission-target"
              placeholder="owner/repo, owner/repo#42, or https://github.com/owner/repo/pull/42"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="font-mono text-xs sm:text-sm"
              disabled={submitting}
            />
            {fleetRepos.length > 0 && (
              <div className="pt-1.5">
                <div className="text-[11px] text-muted-foreground mb-1.5">
                  Quick-fill from Fleet Navigator:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fleetRepos.slice(0, 4).map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => {
                        setTargetInput(`${repo.owner}/${repo.name}`)
                        setBranchOverride(repo.defaultBranch)
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted/40 hover:bg-muted text-[11px] font-mono text-foreground transition-colors cursor-pointer"
                    >
                      <GitBranch size={12} className="text-[var(--aura-aqua)]" />
                      {repo.owner}/{repo.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="admission-branch" className="text-xs sm:text-sm">
                Branch Override (Optional)
              </Label>
              <Input
                id="admission-branch"
                placeholder="main / develop / fix-branch"
                value={branchOverride}
                onChange={(e) => setBranchOverride(e.target.value)}
                className="font-mono text-xs sm:text-sm"
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm">Min Score Threshold</Label>
                <span className="font-mono text-xs font-semibold text-[var(--aura-aqua)] tabular-nums">
                  {scoreThreshold}/100
                </span>
              </div>
              <Slider
                value={[scoreThreshold]}
                min={50}
                max={98}
                step={1}
                onValueChange={(vals) => setScoreThreshold(vals[0] ?? 85)}
                className="pt-2"
                disabled={submitting}
              />
              <p className="text-[11px] text-muted-foreground">
                Repairs run only when score falls below {scoreThreshold}.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 rounded-lg border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label htmlFor="repair-if-needed" className="text-xs sm:text-sm flex items-center gap-1.5">
                  <Wrench size={14} className="text-[var(--aura-yellow)]" />
                  Repair Only If Needed (Score-Gated)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Skip mutations when repo/PR already meets score threshold
                </p>
              </div>
              <Switch
                id="repair-if-needed"
                checked={repairOnlyIfNeeded}
                onCheckedChange={setRepairOnlyIfNeeded}
                disabled={submitting}
              />
            </div>

            <div className="border-t border-border/60 pt-2.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label htmlFor="two-way-sync" className="text-xs sm:text-sm flex items-center gap-1.5">
                  <ArrowsLeftRight size={14} className="text-[var(--aura-violet)]" />
                  GitHub 2-Way Sync (Comments & Push)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Pull remote PR comments & CI runs; push repair branches & summaries
                </p>
              </div>
              <Switch
                id="two-way-sync"
                checked={twoWaySyncEnabled}
                onCheckedChange={setTwoWaySyncEnabled}
                disabled={submitting}
              />
            </div>

            <div className="border-t border-border/60 pt-2.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <Label htmlFor="auto-eval" className="text-xs sm:text-sm">
                  Evaluate & Run Conditional Pipeline Immediately
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Scores all 10 domains on admission and triggers repairs if below threshold
                </p>
              </div>
              <Switch
                id="auto-eval"
                checked={autoEvaluate}
                onCheckedChange={setAutoEvaluate}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-xs sm:text-sm"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 neon-border-aqua glow-aqua text-xs sm:text-sm whitespace-nowrap"
            >
              {submitting ? (
                <>
                  <SpinnerGap size={16} className="mr-1.5 animate-spin" />
                  Fetching & Admitting...
                </>
              ) : (
                'Admit to Pipeline'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
