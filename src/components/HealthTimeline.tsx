import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Warning,
  Info,
  Pulse,
  Calendar,
  CheckCircle,
  XCircle,
  DownloadSimple,
  ShieldCheck,
  GitBranch,
  Wrench,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { TimelineEvent } from '@/lib/types'
import { toast } from 'sonner'

interface HealthTimelineProps {
  events: TimelineEvent[]
  maxHeight?: string
}

export function HealthTimeline({ events, maxHeight = '600px' }: HealthTimelineProps) {
  const [filter, setFilter] = useState<string>('all')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const filteredEvents = events
    .filter((event) => {
      if (filter === 'all') return true
      return event.severity === filter || event.type === filter
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.severity) {
      case 'success':
        return CheckCircle
      case 'warning':
        return Warning
      case 'error':
        return XCircle
      default:
        return Info
    }
  }

  const getEventColor = (event: TimelineEvent) => {
    switch (event.severity) {
      case 'success':
        return {
          glow: 'glow-aqua',
          bg: 'bg-[var(--aura-aqua)]/10',
          text: 'text-[var(--aura-aqua)]',
          border: 'neon-border-aqua',
        }
      case 'warning':
        return {
          glow: 'glow-yellow',
          bg: 'bg-[var(--aura-yellow)]/10',
          text: 'text-[var(--aura-yellow)]',
          border: 'neon-border-yellow',
        }
      case 'error':
        return {
          glow: 'glow-coral',
          bg: 'bg-[var(--aura-coral)]/10',
          text: 'text-[var(--aura-coral)]',
          border: 'neon-border-coral',
        }
      default:
        return {
          glow: 'glow-violet',
          bg: 'bg-[var(--aura-violet)]/10',
          text: 'text-[var(--aura-violet)]',
          border: 'neon-border-violet',
        }
    }
  }

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'scan':
        return GitBranch
      case 'governance':
        return ShieldCheck
      case 'healing':
        return Wrench
      default:
        return Pulse
    }
  }

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const formatFullTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleExport = () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalEvents: filteredEvents.length,
        filter: {
          type: filter,
        },
        events: filteredEvents,
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
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
    <div className={cn('space-y-4')}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-muted-foreground" />
          <span className="text-sm font-space font-semibold">Event Timeline</span>
          <Badge variant="outline" className="text-xs">
            {filteredEvents.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="text-xs"
          >
            <DownloadSimple size={14} />
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="scan">Scans</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
              <SelectItem value="healing">Healing</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="rounded-lg border border-border bg-card/30" style={{ height: maxHeight }}>
        <div className="p-4">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No events found for the selected filter
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event, index) => {
                const Icon = getEventIcon(event)
                const colors = getEventColor(event)
                const isLast = index === filteredEvents.length - 1
                const TypeIcon = getTypeIcon(event.type)
                const isExpanded = expandedEvent === event.id

                return (
                  <div key={event.id} className="relative">
                    {!isLast && (
                      <div
                        className="absolute left-[19px] top-10 bottom-0 w-px bg-border"
                        style={{ height: 'calc(100% + 12px)' }}
                      />
                    )}
                    <div
                      className={cn(
                        'relative p-3 rounded-lg border transition-all cursor-pointer hover:bg-accent/5',
                        colors.border,
                        colors.bg
                      )}
                      onClick={() =>
                        setExpandedEvent(isExpanded ? null : event.id)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex-shrink-0 p-2 rounded-full',
                            colors.bg,
                            colors.glow
                          )}
                        >
                          <Icon size={16} className={colors.text} weight="bold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">
                                {event.title}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                              >
                                <TypeIcon size={12} className="mr-1" />
                                {event.type}
                              </Badge>
                              {event.severity && (
                                <Badge
                                  variant="secondary"
                                  className={cn('text-xs', colors.text)}
                                >
                                  {event.severity}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                              {formatRelativeTime(event.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-border space-y-2">
                              <div className="text-xs text-muted-foreground font-mono">
                                {formatFullTimestamp(event.timestamp)}
                              </div>
                              {event.metadata && (
                                <div className="space-y-1">
                                  {event.metadata.oldScore !== undefined &&
                                    event.metadata.newScore !== undefined && (
                                      <div className="text-xs">
                                        <span className="text-muted-foreground">
                                          Score:{' '}
                                        </span>
                                        <span className="font-mono">
                                          {event.metadata.oldScore} →{' '}
                                          {event.metadata.newScore}
                                        </span>
                                      </div>
                                    )}
                                  {typeof event.metadata.duration === 'number' && (
                                    <div className="text-xs">
                                      <span className="text-muted-foreground">
                                        Duration:{' '}
                                      </span>
                                      <span className="font-mono">
                                        {event.metadata.duration}ms
                                      </span>
                                    </div>
                                  )}
                                  {Object.entries(event.metadata)
                                    .filter(
                                      ([key]) =>
                                        !['oldScore', 'newScore', 'duration'].includes(key)
                                    )
                                    .map(([key, value]) => (
                                      <div key={key} className="text-xs">
                                        <span className="text-muted-foreground capitalize">
                                          {key}:{' '}
                                        </span>
                                        <span className="font-mono">
                                          {String(value)}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
