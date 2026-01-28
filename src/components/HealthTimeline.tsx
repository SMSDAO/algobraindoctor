import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Warning,
  Info,
  CheckCircle,
  XCircle,
  Download,
  ShieldCheck,
  GitBranch,
  Calendar,
} from '@phosphor-icons/react'
import { TimelineEvent } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface HealthTimelineProps {
  events: TimelineEvent[]
  maxHeight?: string
}

export function HealthTimeline({ events, maxHeight = '500px' }: HealthTimelineProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true
    return event.type === filter
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
          border: 'neon-border-blue',
          text: 'text-[var(--aura-blue)]',
        }
    }
  }

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'scan':
        return GitBranch
      case 'healing':
        return ShieldCheck
      case 'governance':
        return Calendar
      default:
        return Info
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleExport = () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        events: filteredEvents,
        filter: {
          type: filter,
        },
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timeline-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Timeline exported successfully')
    } catch (error) {
      toast.error('Failed to export timeline')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-muted-foreground" />
          <h3 className="text-base font-space font-semibold">Activity Timeline</h3>
          <Badge variant="outline" className="text-xs">
            {filteredEvents.length} events
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={filteredEvents.length === 0}
          >
            <Download size={16} />
            Export
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="scan">Scans</SelectItem>
              <SelectItem value="healing">Healing</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="pr-4" style={{ height: maxHeight }}>
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No events match the selected filter
            </div>
          ) : (
            filteredEvents.map((event) => {
              const colors = getEventColor(event)
              const SeverityIcon = getSeverityIcon(event.severity)
              const TypeIcon = getTypeIcon(event.type)
              const isExpanded = expandedEvent === event.id

              return (
                <div
                  key={event.id}
                  className={cn(
                    'rounded-lg border p-4 transition-all duration-200 cursor-pointer',
                    colors.border,
                    colors.bg,
                    isExpanded && 'ring-2 ring-primary/20'
                  )}
                  style={{ height: isExpanded ? 'auto' : 'auto' }}
                  onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('flex-shrink-0 mt-0.5', colors.text)}>
                      <TypeIcon size={20} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-space font-semibold text-sm">{event.title}</span>
                          {event.severity !== 'info' && (
                            <Badge
                              variant="outline"
                              className={cn('text-xs', colors.text)}
                            >
                              <SeverityIcon size={12} className="mr-1" />
                              {event.severity}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                      {isExpanded && event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-3 p-3 bg-background/50 rounded border border-border">
                          <div className="text-xs font-mono space-y-1.5">
                            <div className="text-muted-foreground font-semibold mb-2">
                              <span className="text-foreground">Event Metadata</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(event.metadata)
                                .filter(([key]) => !['oldScore', 'newScore'].includes(key))
                                .map(([key, value]) => (
                                  <div key={key} className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">
                                      {key}:
                                    </span>
                                    <span className="text-foreground">
                                      {String(value)}
                                    </span>
                                  </div>
                                ))}
                              {event.metadata.oldScore !== undefined &&
                                event.metadata.newScore !== undefined && (
                                  <div className="col-span-2 flex items-center gap-2 mt-1">
                                    <span className="text-muted-foreground">Score:</span>
                                    <span className="text-foreground">
                                      {String(event.metadata.oldScore)}
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className={cn('font-semibold', colors.text)}>
                                      {String(event.metadata.newScore)}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
