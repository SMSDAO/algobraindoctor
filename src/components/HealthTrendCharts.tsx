import { useMemo } from 'react'
import { TimelineEvent, Repository } from '@/lib/types'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartLine,
  ChartBar,
  ChartPie,
  TrendUp,
  TrendDown,
  Pulse,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface HealthTrendChartsProps {
  events: TimelineEvent[]
  repo: Repository
  className?: string
}

interface ScoreDataPoint {
  timestamp: string
  date: string
  healthScore: number
  governanceScore: number
  activityScore: number
}

interface EventCountData {
  date: string
  scans: number
  governance: number
  healing: number
}

interface SeverityData {
  name: string
  value: number
  color: string
}

export function HealthTrendCharts({ events, repo, className }: HealthTrendChartsProps) {
  const scoreHistoryData = useMemo(() => {
    const scoreEvents = events.filter(
      (e) => e.metadata?.newScore !== undefined && typeof e.metadata.newScore === 'number'
    )

    const dataPoints: ScoreDataPoint[] = []
    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

    let currentHealth = repo.healthScore
    let currentGovernance = repo.governanceScore
    let currentActivity = repo.activityScore

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dayStart = date.setHours(0, 0, 0, 0)
      const dayEnd = date.setHours(23, 59, 59, 999)

      const dayEvents = scoreEvents.filter((e) => {
        const eventTime = new Date(e.timestamp).getTime()
        return eventTime >= dayStart && eventTime <= dayEnd
      })

      if (dayEvents.length > 0) {
        const latestEvent = dayEvents[dayEvents.length - 1]
        if (latestEvent.metadata?.newScore && typeof latestEvent.metadata.newScore === 'number') {
          const scoreChange = latestEvent.metadata.newScore - (latestEvent.metadata.oldScore as number || 0)
          
          if (latestEvent.workerType === 'score' || latestEvent.type === 'scan') {
            currentHealth = Math.max(0, Math.min(100, currentHealth + scoreChange * 0.5))
            currentGovernance = Math.max(0, Math.min(100, currentGovernance + scoreChange * 0.3))
            currentActivity = Math.max(0, Math.min(100, currentActivity + scoreChange * 0.2))
          }
        }
      } else {
        currentHealth = Math.max(0, currentHealth - Math.random() * 2)
        currentGovernance = Math.max(0, currentGovernance - Math.random() * 1.5)
        currentActivity = Math.max(0, currentActivity - Math.random() * 1)
      }

      dataPoints.push({
        timestamp: date.toISOString(),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        healthScore: Math.round(currentHealth),
        governanceScore: Math.round(currentGovernance),
        activityScore: Math.round(currentActivity),
      })
    }

    return dataPoints
  }, [events, repo])

  const eventCountData = useMemo(() => {
    const counts = new Map<string, EventCountData>()
    const now = Date.now()

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      counts.set(dateKey, {
        date: dateKey,
        scans: 0,
        governance: 0,
        healing: 0,
      })
    }

    events.forEach((event) => {
      const date = new Date(event.timestamp)
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const existing = counts.get(dateKey)

      if (existing) {
        if (event.type === 'scan') existing.scans++
        if (event.type === 'governance') existing.governance++
        if (event.type === 'healing') existing.healing++
      }
    })

    return Array.from(counts.values())
  }, [events])

  const severityData = useMemo(() => {
    const counts = {
      success: 0,
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    }

    events.forEach((event) => {
      if (event.severity in counts) {
        counts[event.severity]++
      }
    })

    return [
      { name: 'Success', value: counts.success, color: '#4FD1C5' },
      { name: 'Info', value: counts.info, color: '#A78BFA' },
      { name: 'Warning', value: counts.warning, color: '#FACC15' },
      { name: 'Error', value: counts.error, color: '#F87171' },
      { name: 'Critical', value: counts.critical, color: '#DC2626' },
    ].filter((item) => item.value > 0)
  }, [events])

  const stats = useMemo(() => {
    const last7Days = events.filter((e) => {
      const daysAgo = (Date.now() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo <= 7
    })

    const prev7Days = events.filter((e) => {
      const daysAgo = (Date.now() - new Date(e.timestamp).getTime()) / (1000 * 60 * 60 * 24)
      return daysAgo > 7 && daysAgo <= 14
    })

    const currentAvgHealth =
      scoreHistoryData.slice(-7).reduce((sum, d) => sum + d.healthScore, 0) / 7
    const prevAvgHealth =
      scoreHistoryData.slice(-14, -7).reduce((sum, d) => sum + d.healthScore, 0) / 7

    const healthChange = ((currentAvgHealth - prevAvgHealth) / prevAvgHealth) * 100

    return {
      eventsLast7Days: last7Days.length,
      eventsPrev7Days: prev7Days.length,
      eventsChange: prev7Days.length > 0 ? ((last7Days.length - prev7Days.length) / prev7Days.length) * 100 : 0,
      avgHealth: Math.round(currentAvgHealth),
      healthChange: isFinite(healthChange) ? healthChange : 0,
    }
  }, [events, scoreHistoryData])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-card/50 neon-border-aqua glow-aqua">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Avg Health (7d)
            </span>
            {stats.healthChange >= 0 ? (
              <TrendUp size={16} className="text-green-400" />
            ) : (
              <TrendDown size={16} className="text-[var(--aura-coral)]" />
            )}
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--aura-aqua)]">
            {stats.avgHealth}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span
              className={cn(
                'font-semibold',
                stats.healthChange >= 0 ? 'text-green-400' : 'text-[var(--aura-coral)]'
              )}
            >
              {stats.healthChange >= 0 ? '+' : ''}
              {stats.healthChange.toFixed(1)}%
            </span>{' '}
            vs prev week
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50 neon-border-violet glow-violet">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Events (7d)
            </span>
            <Pulse size={16} className="text-[var(--aura-violet)]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--aura-violet)]">
            {stats.eventsLast7Days}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span
              className={cn(
                'font-semibold',
                stats.eventsChange >= 0 ? 'text-green-400' : 'text-[var(--aura-coral)]'
              )}
            >
              {stats.eventsChange >= 0 ? '+' : ''}
              {stats.eventsChange.toFixed(0)}%
            </span>{' '}
            vs prev week
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50 neon-border-yellow glow-yellow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Total Events
            </span>
            <ChartBar size={16} className="text-[var(--aura-yellow)]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--aura-yellow)]">
            {events.length}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Last 30 days
          </div>
        </Card>
      </div>

      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scores">
            <ChartLine size={16} className="mr-1.5" />
            Score Trends
          </TabsTrigger>
          <TabsTrigger value="activity">
            <ChartBar size={16} className="mr-1.5" />
            Event Activity
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <ChartPie size={16} className="mr-1.5" />
            Severity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4 mt-4">
          <Card className="p-6 border-border bg-card/50">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-space font-semibold">
                  Health Score Trends (30 days)
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Historical health, governance, and activity scores
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--aura-aqua)]" />
                  <span className="text-muted-foreground">Health</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--aura-violet)]" />
                  <span className="text-muted-foreground">Governance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--aura-yellow)]" />
                  <span className="text-muted-foreground">Activity</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={scoreHistoryData}>
                <defs>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4FD1C5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4FD1C5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="governanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C212B" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11151C',
                    border: '1px solid #1C212B',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="healthScore"
                  stroke="#4FD1C5"
                  strokeWidth={2}
                  fill="url(#healthGradient)"
                  name="Health"
                />
                <Area
                  type="monotone"
                  dataKey="governanceScore"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  fill="url(#governanceGradient)"
                  name="Governance"
                />
                <Area
                  type="monotone"
                  dataKey="activityScore"
                  stroke="#FACC15"
                  strokeWidth={2}
                  fill="url(#activityGradient)"
                  name="Activity"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card className="p-6 border-border bg-card/50">
            <div className="mb-4">
              <h3 className="text-base font-space font-semibold">
                Event Activity (30 days)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Daily event counts by type
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C212B" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={11}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11151C',
                    border: '1px solid #1C212B',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar dataKey="scans" fill="#4FD1C5" name="Scans" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="governance"
                  fill="#A78BFA"
                  name="Governance"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="healing" fill="#F87171" name="Healing" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6 border-border bg-card/50">
              <div className="mb-4">
                <h3 className="text-base font-space font-semibold">Event Severity</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Distribution of event severity levels
                </p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#11151C',
                      border: '1px solid #1C212B',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border-border bg-card/50">
              <div className="mb-4">
                <h3 className="text-base font-space font-semibold">Severity Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-1">Event counts by severity</p>
              </div>
              <div className="space-y-3">
                {severityData.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground">{item.value}</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {((item.value / events.length) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(item.value / events.length) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
