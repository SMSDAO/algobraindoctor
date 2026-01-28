import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Warning,
  XCircle,
  Info,
  Download,
} from '@phosphor-icons/react'
import { TimelineEvent } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface HealthTimelineProps {
  events: TimelineEvent[]
}

export function HealthTimeline({ events }: HealthTimelineProps) {
  const [eventFilter, setEventFilter] = useState<string>('all')

  const filteredEvents = events.filter((event) => {
    if (eventFilter === 'all') return true
    return event.type === eventFilter
  })

  const getSeverityIcon = (severity: TimelineEvent['severity']) => {
    switch (severity) {
      case 'success':
        return CheckCircle
      case 'warning':
      case 'critical':
        return Warning
      case 'error':
        return XCircle
      case 'info':
      default:
        return Info
    }
  }

  const getEventColor = (event: TimelineEvent) => {
    switch (event.severity) {
      case 'success':
        return {
          bg: 'bg-[var(--aura-aqua)]/10',
          border: 'neon-border-aqua',
          text: 'text-[var(--aura-aqua)]',
        }
      case 'warning':
      case 'critical':
        return {
          bg: 'bg-[var(--aura-yellow)]/10',
          border: 'neon-border-yellow',
          text: 'text-[var(--aura-yellow)]',
        }
      case 'error':
        return {
          bg: 'bg-[var(--aura-coral)]/10',
          border: 'neon-border-coral',
          text: 'text-[var(--aura-coral)]',
        }
      case 'info':
      default:
        return {
          bg: 'bg-[var(--aura-blue)]/10',
          border: 'neon-border-violet',
          text: 'text-[var(--aura-blue)]',
        }
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `timeline-events-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 justify-between">
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filteredEvents.length > 0 && (
              <SelectItem value="all">All Events</SelectItem>
            )}
            <SelectItem value="scan">Scans</SelectItem>
            <SelectItem value="governance">Governance</SelectItem>
            <SelectItem value="healing">Healing</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={filteredEvents.length === 0}
        >
          <Download size={16} />
          Export
        </Button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No events found
          </div>
        ) : (
          filteredEvents.map((event) => {
            const SeverityIcon = getSeverityIcon(event.severity)
            const colors = getEventColor(event)
            const relativeTime = formatDistanceToNow(new Date(event.timestamp), {
              addSuffix: true,
            })

            return (
              <div
                key={event.id}
                className={cn(
                  'p-4 rounded-lg border transition-all hover:scale-[1.02]',
                  colors.bg,
                  colors.border,
                )}
              >
                <div className="flex gap-3">
                  <div className={cn('flex-shrink-0 mt-0.5', colors.text)}>
                    <SeverityIcon size={20} weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-space font-semibold text-sm">
                          {event.title}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn('text-xs capitalize', colors.text)}
                        >
                          <SeverityIcon size={12} className="mr-1" />
                          {event.severity}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {relativeTime}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(event.metadata)
                          .filter(([key, value]) => value !== undefined && value !== null)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="text-xs font-mono bg-card/50 px-2 py-1 rounded border border-border"
                            >
                              <span className="text-muted-foreground">{key}:</span>{' '}
                              <span className="font-semibold">
                                {typeof value === 'object'
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                    {event.workerType && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs font-mono">
                          {event.workerType}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
