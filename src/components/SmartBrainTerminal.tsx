import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { LogEntry } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Info, Warning, XCircle } from '@phosphor-icons/react'

interface SmartBrainTerminalProps {
  logs: LogEntry[]
  maxHeight?: string
}

export function SmartBrainTerminal({ logs, maxHeight = '400px' }: SmartBrainTerminalProps) {
  const getLevelConfig = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return {
          icon: XCircle,
          color: 'text-[var(--aura-coral)]',
          bg: 'bg-[var(--aura-coral)]/10',
          border: 'border-l-[var(--aura-coral)]',
        }
      case 'warn':
        return {
          icon: Warning,
          color: 'text-[var(--aura-yellow)]',
          bg: 'bg-[var(--aura-yellow)]/10',
          border: 'border-l-[var(--aura-yellow)]',
        }
      default:
        return {
          icon: Info,
          color: 'text-[var(--aura-aqua)]',
          bg: 'bg-[var(--aura-aqua)]/10',
          border: 'border-l-[var(--aura-aqua)]',
        }
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm">
      <div className="border-b border-border px-3 sm:px-4 py-2 flex items-center gap-2">
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[var(--aura-coral)] animate-pulse" />
        <span className="text-xs sm:text-sm font-space font-semibold">Smart Brain Terminal</span>
        <Badge variant="outline" className="ml-auto text-[10px] sm:text-xs font-mono">
          {logs.length} entries
        </Badge>
      </div>
      <ScrollArea style={{ height: maxHeight }}>
        <div className="p-1.5 sm:p-2 space-y-1 font-mono text-[10px] sm:text-xs">
          {logs.map((log) => {
            const config = getLevelConfig(log.level)
            const Icon = config.icon
            return (
              <div
                key={log.id}
                className={cn(
                  'p-1.5 sm:p-2 rounded border-l-2 transition-all duration-200',
                  config.bg,
                  config.border,
                  'hover:brightness-110'
                )}
              >
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <Icon size={12} className={cn('sm:w-[14px] sm:h-[14px]', config.color, 'mt-0.5 flex-shrink-0')} />
                  <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-muted-foreground text-[9px] sm:text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.workerType && (
                        <Badge variant="outline" className="text-[8px] sm:text-[10px] px-1 py-0">
                          {log.workerType}
                        </Badge>
                      )}
                      <span className={cn('uppercase text-[8px] sm:text-[10px]', config.color)}>
                        {log.level}
                      </span>
                    </div>
                    <div className="text-foreground/90 break-words">{log.message}</div>
                    {log.context && (
                      <div className="text-muted-foreground text-[8px] sm:text-[10px] pl-1.5 sm:pl-2 border-l border-border/50 break-all">
                        {JSON.stringify(log.context, null, 2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
