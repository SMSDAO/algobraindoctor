import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Repository, TimelineEvent } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Pulse, ChartLine, TrendUp, ClockCounterClockwise, ChartLineUp } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { HealthTimeline } from '@/components/HealthTimeline'
import { HealthTrendCharts } from '@/components/HealthTrendCharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface VitalsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repo: Repository | null
  timelineEvents?: TimelineEvent[]
}

export function VitalsModal({ open, onOpenChange, repo, timelineEvents = [] }: VitalsModalProps) {
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
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-md neon-border-aqua glow-aqua">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-space flex items-center gap-2">
            <Pulse size={24} className="sm:w-7 sm:h-7 text-[var(--aura-aqua)]" />
            <span className="hidden sm:inline">Repository Health Dashboard</span>
            <span className="sm:hidden">Health Dashboard</span>
          </DialogTitle>
          <div className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
            {repo.owner}/{repo.name}
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
              <Pulse size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="charts" className="text-xs sm:text-sm py-2">
              <ChartLineUp size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs sm:text-sm py-2">
              <ClockCounterClockwise size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 py-3 sm:py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {metrics.map((metric) => {
                const Icon = metric.icon
                return (
                  <div
                    key={metric.label}
                    className={cn(
                      'p-3 sm:p-4 rounded-lg border bg-card/50',
                      metric.glow,
                      'neon-border-aqua'
                    )}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <Icon size={18} className={cn('sm:w-5 sm:h-5', metric.color)} />
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">
                        {metric.label}
                      </div>
                    </div>
                    <div className={cn('text-2xl sm:text-3xl font-mono font-bold', metric.color)}>
                      {metric.value}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <TrendUp size={10} className="sm:w-3 sm:h-3 text-green-400" />
                      <span>+2.4%</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="text-xs sm:text-sm font-space font-semibold">Repository Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-card/50 border border-border">
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Default Branch</div>
                  <div className="font-mono text-xs sm:text-sm">{repo.defaultBranch}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Last Indexed</div>
                  <div className="font-mono text-xs sm:text-sm">
                    {new Date(repo.lastIndexedAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Identity Claims</div>
                  <div className="font-mono text-xs sm:text-sm">{repo.claimsCount}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">Provider</div>
                  <div className="font-mono text-xs sm:text-sm capitalize">{repo.provider}</div>
                </div>
              </div>
            </div>

            {repo.frameworks.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <div className="text-xs sm:text-sm font-space font-semibold">Detected Frameworks</div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {repo.frameworks.map((fw) => (
                    <Badge
                      key={fw}
                      variant="secondary"
                      className="neon-border-yellow glow-yellow text-xs"
                    >
                      {fw}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="charts" className="flex-1 overflow-y-auto py-3 sm:py-4">
            <HealthTrendCharts 
              events={timelineEvents}
              repo={repo}
            />
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 overflow-hidden py-3 sm:py-4">
            <HealthTimeline 
              events={timelineEvents}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
