import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { HealdecLogEntry } from '@/lib/types'
import { ShieldCheck, Wrench, Warning, ArrowsClockwise } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface HealdecModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  logs: HealdecLogEntry[]
}

const ACTION_CONFIG = {
  retry: {
    icon: ArrowsClockwise,
    color: 'text-[var(--aura-aqua)]',
    label: 'Retry',
  },
  reroute: {
    icon: ArrowsClockwise,
    color: 'text-[var(--aura-violet)]',
    label: 'Reroute',
  },
  quarantine: {
    icon: Warning,
    color: 'text-[var(--aura-yellow)]',
    label: 'Quarantine',
  },
  repair_triggered: {
    icon: Wrench,
    color: 'text-[var(--aura-coral)]',
    label: 'Repair',
  },
  escalate: {
    icon: Warning,
    color: 'text-[var(--aura-coral)]',
    label: 'Escalate',
  },
}

export function HealdecModal({ open, onOpenChange, logs }: HealdecModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden bg-card/95 backdrop-blur-md neon-border-violet glow-violet">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-lg sm:text-2xl font-space flex items-center gap-2">
            <ShieldCheck size={24} className="sm:w-7 sm:h-7 text-[var(--aura-violet)]" />
            Healdec Auto-Healing Log
          </DialogTitle>
          <div className="text-xs sm:text-sm text-muted-foreground tabular-nums">
            {logs.length} healing actions recorded
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs sm:text-sm text-muted-foreground">
              No auto-healing actions recorded yet.
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 py-1">
              {logs.map((log) => {
                const config = ACTION_CONFIG[log.action]
                const Icon = config.icon
                return (
                  <div
                    key={log.id}
                    className="p-3 sm:p-4 rounded-lg border border-border bg-card/50 hover:bg-card/70 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <Icon size={18} className={cn('sm:w-5 sm:h-5', config.color)} />
                        <Badge variant="outline" className={cn('text-[10px] sm:text-xs', config.color)}>
                          {config.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] sm:text-xs font-mono">
                          {log.workerType}
                        </Badge>
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground font-mono flex-shrink-0 tabular-nums">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="text-xs sm:text-sm">{log.reason}</div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground font-mono">
                        <span>Job ID:</span>
                        <span className="text-foreground break-all">{log.jobId}</span>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <details className="text-[10px] sm:text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Show metadata
                          </summary>
                          <pre className="mt-1.5 sm:mt-2 p-1.5 sm:p-2 bg-background/50 rounded border border-border overflow-x-auto text-[9px] sm:text-xs">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
