import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CircleNotch, Gear } from '@phosphor-icons/react'
import { Worker, WorkerType } from '@/lib/types'
import { cn } from '@/lib/utils'

const WORKER_LABELS: Record<WorkerType, string> = {
  index: 'Index',
  identity: 'Identity',
  score: 'Score',
  ingest: 'Ingest',
  sync: 'Sync',
  gc: 'GC',
  alert: 'Alert',
  export: 'Export',
  audit: 'Audit',
  repair: 'Repair',
  backfill: 'Backfill',
  maintenance: 'Maintenance',
}

interface WorkerCardProps {
  worker: Worker
  onClick?: () => void
}

export function WorkerCard({ worker, onClick }: WorkerCardProps) {
  const statusConfig = {
    healthy: {
      color: 'text-[var(--aura-aqua)]',
      glow: 'glow-aqua',
      border: 'neon-border-aqua',
    },
    degraded: {
      color: 'text-[var(--aura-yellow)]',
      glow: 'glow-yellow',
      border: 'neon-border-yellow',
    },
    failed: {
      color: 'text-[var(--aura-coral)]',
      glow: 'glow-coral',
      border: 'neon-border-coral',
    },
  }

  const config = statusConfig[worker.status]

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:scale-[1.02]',
        config.border,
        config.glow,
        'bg-card/80 backdrop-blur-sm'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {worker.status === 'healthy' ? (
              <CircleNotch size={18} className={cn('sm:w-5 sm:h-5', config.color, 'animate-spin')} />
            ) : (
              <Gear size={18} className={cn('sm:w-5 sm:h-5', config.color)} />
            )}
            <CardTitle className="text-sm sm:text-base font-space">
              {WORKER_LABELS[worker.type]}
            </CardTitle>
          </div>
          <Badge variant="outline" className={cn('text-[10px] sm:text-xs uppercase', config.color)}>
            {worker.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 sm:space-y-2">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs">
          <div>
            <div className="text-muted-foreground">Completed</div>
            <div className="font-mono font-medium">{worker.jobsCompleted}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Failed</div>
            <div className="font-mono font-medium">{worker.jobsFailed}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Queue</div>
            <div className="font-mono font-medium">{worker.queueSize}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Avg Time</div>
            <div className="font-mono font-medium">{worker.avgDuration}ms</div>
          </div>
        </div>
        <div className="text-[10px] sm:text-xs text-muted-foreground font-mono pt-1 border-t border-border">
          Last run: {new Date(worker.lastRun).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}
