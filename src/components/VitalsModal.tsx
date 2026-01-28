import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Repository, Score } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Pulse, ChartLine, TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface VitalsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repo: Repository | null
}

export function VitalsModal({ open, onOpenChange, repo }: VitalsModalProps) {
  if (!repo) return null

  const metrics = [
    {
      label: 'Health Score',
      value: repo.healthScore,
      icon: Pulse,
      color: 'text-[var(--aura-aqua)]',
      glow: 'glow-aqua',
    },
    {
      label: 'Activity Score',
      value: repo.activityScore,
      icon: ChartLine,
      color: 'text-[var(--aura-violet)]',
      glow: 'glow-violet',
    },
    {
      label: 'Governance',
      value: repo.governanceScore,
      icon: ChartLine,
      color: 'text-[var(--aura-yellow)]',
      glow: 'glow-yellow',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-md neon-border-aqua glow-aqua">
        <DialogHeader>
          <DialogTitle className="text-2xl font-space flex items-center gap-2">
            <Pulse size={28} className="text-[var(--aura-aqua)]" />
            Repository Vitals
          </DialogTitle>
          <div className="text-sm text-muted-foreground font-mono">
            {repo.owner}/{repo.name}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon
              return (
                <div
                  key={metric.label}
                  className={cn(
                    'p-4 rounded-lg border bg-card/50',
                    metric.glow,
                    'neon-border-aqua'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={20} className={metric.color} />
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {metric.label}
                    </div>
                  </div>
                  <div className={cn('text-3xl font-mono font-bold', metric.color)}>
                    {metric.value}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendUp size={12} className="text-green-400" />
                    <span>+2.4%</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-space font-semibold">Repository Details</div>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-card/50 border border-border">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Default Branch</div>
                <div className="font-mono text-sm">{repo.defaultBranch}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Last Indexed</div>
                <div className="font-mono text-sm">
                  {new Date(repo.lastIndexedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Identity Claims</div>
                <div className="font-mono text-sm">{repo.claimsCount}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Provider</div>
                <div className="font-mono text-sm capitalize">{repo.provider}</div>
              </div>
            </div>
          </div>

          {repo.frameworks.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-space font-semibold">Detected Frameworks</div>
              <div className="flex flex-wrap gap-2">
                {repo.frameworks.map((fw) => (
                  <Badge
                    key={fw}
                    variant="secondary"
                    className="neon-border-yellow glow-yellow"
                  >
                    {fw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
