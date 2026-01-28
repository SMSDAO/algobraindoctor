import { useState } from 'react'
import { TimelineEvent, WorkerType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CheckCircle,
  Warning,
  XCircle,
  Info,
  ShieldCheck,
  Pulse,
  GitBranch,
  Key,
  Wrench,
  ChartLine,
  Bug,
  ArrowUp,
  ArrowDown,
  Gear,
  CalendarBlank,
  DownloadSimple,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface HealthTimelineProps {
  events: TimelineEvent[]
  className?: string
  maxHeight?: string
}

export function HealthTimeline({ events, className, maxHeight = '600px' }: HealthTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'scan' | 'governance' | 'healing'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success' | 'critical'>('all')
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)

  const filteredEvents = events
    .filter((event) => filter === 'all' || event.type === filter)
    .filter((event) => severityFilter === 'all' || event.severity === severityFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const eventStats = {
    total: filteredEvents.length,
    byType: {
      scan: filteredEvents.filter(e => e.type === 'scan').length,
      governance: filteredEvents.filter(e => e.type === 'governance').length,
      healing: filteredEvents.filter(e => e.type === 'healing').length,
    },
    bySeverity: {
      success: filteredEvents.filter(e => e.severity === 'success').length,
      info: filteredEvents.filter(e => e.severity === 'info').length,
      warning: filteredEvents.filter(e => e.severity === 'warning').length,
      error: filteredEvents.filter(e => e.severity === 'error').length,
      critical: filteredEvents.filter(e => e.severity === 'critical').length,
    },
  }

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.severity) {
      case 'success':
        return CheckCircle
      case 'warning':
        return Warning
      case 'error':
        return XCircle
      case 'critical':
        return XCircle
      default:
        return Info
    }
  }

  const getEventColor = (event: TimelineEvent) => {
    switch (event.severity) {
      case 'success':
        return {
          text: 'text-[var(--aura-aqua)]',
          glow: 'glow-aqua',
          border: 'neon-border-aqua',
          bg: 'bg-[var(--aura-aqua)]/10',
        }
      case 'warning':
        return {
          text: 'text-[var(--aura-yellow)]',
          glow: 'glow-yellow',
          border: 'neon-border-yellow',
          bg: 'bg-[var(--aura-yellow)]/10',
        }
      case 'error':
      case 'critical':
        return {
          text: 'text-[var(--aura-coral)]',
          glow: 'glow-coral',
          border: 'neon-border-coral',
          bg: 'bg-[var(--aura-coral)]/10',
        }
      default:
        return {
          text: 'text-[var(--aura-violet)]',
          glow: 'glow-violet',
          border: 'neon-border-violet',
          bg: 'bg-[var(--aura-violet)]/10',
        }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scan':
        return Pulse
      case 'governance':
        return ShieldCheck
      case 'healing':
        return Wrench
      default:
        return Info
    }
  }

  const formatTimestamp = (timestamp: string) => {
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

  const formatFullTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const handleExport = () => {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalEvents: filteredEvents.length,
        filters: {
          type: filter,
          severity: severityFilter,
        },
        events: filteredEvents,
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `health-timeline-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Timeline exported', {
        description: `${filteredEvents.length} events exported to JSON`,
      })
    } catch (error) {
      toast.error('Export failed', {
        description: 'Could not export timeline data',
      })
      console.error('Export error:', error)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <CalendarBlank size={20} className="text-muted-foreground" />
          <span className="text-sm font-space font-semibold">Health Timeline</span>
          <Badge variant="outline" className="font-mono text-xs">
            {filteredEvents.length} events
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {eventStats.byType.scan > 0 && (
            <Badge variant="outline" className="text-xs neon-border-aqua">
              <Pulse size={12} className="mr-1" />
              {eventStats.byType.scan} scans
            </Badge>
          )}
          {eventStats.byType.governance > 0 && (
            <Badge variant="outline" className="text-xs neon-border-violet">
              <ShieldCheck size={12} className="mr-1" />
              {eventStats.byType.governance} governance
            </Badge>
          )}
          {eventStats.byType.healing > 0 && (
            <Badge variant="outline" className="text-xs neon-border-yellow">
              <Wrench size={12} className="mr-1" />
              {eventStats.byType.healing} healing
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={filteredEvents.length === 0}
            className="h-8"
          >
            <DownloadSimple size={16} className="mr-1.5" />
            Export
          </Button>

          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="scan">Scans</SelectItem>
              <SelectItem value="governance">Governance</SelectItem>
              <SelectItem value="healing">Healing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as typeof severityFilter)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="rounded-lg border border-border bg-card/30" style={{ height: maxHeight }}>
        <div className="p-4">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Pulse size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event, index) => {
                const Icon = getEventIcon(event)
                const TypeIcon = getTypeIcon(event.type)
                const colors = getEventColor(event)
                const isExpanded = expandedEvent === event.id
                const isLast = index === filteredEvents.length - 1

                return (
                  <div key={event.id} className="relative">
                    {!isLast && (
                      <div
                        className="absolute left-[19px] top-10 bottom-[-12px] w-[2px] bg-border"
                        style={{ opacity: 0.3 }}
                      />
                    )}

                    <div
                      className={cn(
                        'relative p-4 rounded-lg border bg-card/50 transition-all duration-200',
                        colors.border,
                        isExpanded && colors.glow,
                        'hover:bg-card/70 cursor-pointer'
                      )}
                      onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                            colors.bg,
                            colors.border
                          )}
                        >
                          <Icon size={20} className={colors.text} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-space font-semibold text-sm">
                                {event.title}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  variant="outline"
                                  className={cn('text-xs', colors.text)}
                                >
                                  <TypeIcon size={12} className="mr-1" />
                                  {event.type}
                                </Badge>
                                {event.workerType && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Gear size={12} className="mr-1" />
                                    {event.workerType}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>

                          {isExpanded && event.metadata && (
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                              <div className="text-xs text-muted-foreground font-mono mb-2">
                                {formatFullTimestamp(event.timestamp)}
                              </div>
                              
                              {event.metadata.oldScore !== undefined && event.metadata.newScore !== undefined && typeof event.metadata.oldScore === 'number' && typeof event.metadata.newScore === 'number' && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Score:</span>
                                  <span className="font-mono">{event.metadata.oldScore}</span>
                                  {event.metadata.newScore > event.metadata.oldScore ? (
                                    <ArrowUp size={16} className="text-green-400" />
                                  ) : (
                                    <ArrowDown size={16} className="text-[var(--aura-coral)]" />
                                  )}
                                  <span className={cn(
                                    'font-mono font-bold',
                                    event.metadata.newScore > event.metadata.oldScore
                                      ? 'text-green-400'
                                      : 'text-[var(--aura-coral)]'
                                  )}>
                                    {event.metadata.newScore}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {event.metadata.newScore > event.metadata.oldScore ? '+' : ''}
                                    {((event.metadata.newScore - event.metadata.oldScore) / event.metadata.oldScore * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                              )}

                              {event.metadata.duration && typeof event.metadata.duration === 'number' ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Duration:</span>
                                  <span className="font-mono">{event.metadata.duration}ms</span>
                                </div>
                              ) : null}

                              {event.metadata.framework && typeof event.metadata.framework === 'string' ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Framework:</span>
                                  <Badge variant="secondary" className="neon-border-yellow">
                                    {event.metadata.framework}
                                  </Badge>
                                </div>
                              ) : null}

                              {event.metadata.issueCount !== undefined && typeof event.metadata.issueCount === 'number' && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Issues Found:</span>
                                  <Badge variant="destructive" className="font-mono">
                                    {event.metadata.issueCount}
                                  </Badge>
                                </div>
                              )}

                              <div className="space-y-2">
                                {Object.entries(event.metadata)
                                  .filter(([key]) => !['oldScore', 'newScore', 'duration', 'framework', 'issueCount'].includes(key))
                                  .map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-2 text-sm">
                                      <span className="text-muted-foreground capitalize">
                                        {key.replace(/_/g, ' ')}:
                                      </span>
                                      <span className="font-mono text-xs break-all">
                                        {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
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
