import { useMemo } from 'react'
import { TimelineEvent, Repository } from '@/lib/types'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

export function HealthTrendCharts({ events, repo, className }: HealthTrendChartsProps) {
  const scoreHistoryData = useMemo(() => {
    const dataPoints: Array<{ date: string; healthScore: number; governanceScore: number }> = []
    const now = Date.now()

    let currentHealthScore = repo.healthScore
    let currentGovernanceScore = repo.governanceScore

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 3600000)
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime()
      const dayEvents = events.filter((e) => {
        const eventTime = new Date(e.timestamp).getTime()
        return eventTime >= dayStart && eventTime <= dayEnd
      })

      if (dayEvents.length > 0) {
        const latestEvent = dayEvents[dayEvents.length - 1]
        if (latestEvent.metadata?.newScore !== undefined) {
          const scoreChange = (latestEvent.metadata.newScore as number) - currentHealthScore
          currentHealthScore = latestEvent.metadata.newScore as number

          if (latestEvent.type === 'governance') {
            currentGovernanceScore = Math.max(0, Math.min(100, currentGovernanceScore + scoreChange))
          }
        }
      } else {
        currentHealthScore = Math.max(0, currentHealthScore - Math.random() * 2)
      }

      dataPoints.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        healthScore: Math.round(currentHealthScore),
        governanceScore: Math.round(currentGovernanceScore),
      })
    }

    return dataPoints
  }, [events, repo.healthScore, repo.governanceScore])

  const eventCountData = useMemo(() => {
    const counts = new Map<string, { date: string; scan: number; governance: number; healing: number }>()

    events.forEach((event) => {
      const date = new Date(event.timestamp)
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      if (!counts.has(dateKey)) {
        counts.set(dateKey, {
          date: dateKey,
          scan: 0,
          governance: 0,
          healing: 0,
        })
      }

      const existing = counts.get(dateKey)
      if (existing) {
        if (event.type === 'scan') existing.scan++
        else if (event.type === 'governance') existing.governance++
        else if (event.type === 'healing') existing.healing++
      }
    })

    return Array.from(counts.values()).slice(-30)
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
        counts[event.severity as keyof typeof counts]++
      }
    })

    return [
      { name: 'Success', value: counts.success, color: '#4FD1C5' },
      { name: 'Info', value: counts.info, color: '#A78BFA' },
      { name: 'Warning', value: counts.warning, color: '#FACC15' },
      { name: 'Error', value: counts.error, color: '#FB923C' },
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
      avgHealth: Math.round(currentAvgHealth),
      healthChange: Math.round(healthChange * 10) / 10,
      eventsLast7Days: last7Days.length,
      eventChange: ((last7Days.length - prev7Days.length) / (prev7Days.length || 1)) * 100,
    }
  }, [events, scoreHistoryData])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-card/50 neon-border-aqua">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Avg Health (7d)</span>
            {stats.healthChange >= 0 ? (
              <TrendUp size={16} className="text-[var(--aura-aqua)]" />
            ) : (
              <TrendDown size={16} className="text-[var(--aura-coral)]" />
            )}
          </div>
          <div className="text-2xl font-mono font-bold">{stats.avgHealth}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span
              className={cn(
                'font-semibold',
                stats.healthChange >= 0 ? 'text-[var(--aura-aqua)]' : 'text-[var(--aura-coral)]'
              )}
            >
              {stats.healthChange >= 0 ? '+' : ''}
              {stats.healthChange}%
            </span>{' '}
            vs prev 7d
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50 neon-border-violet">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Events (7d)</span>
            <Pulse size={16} className="text-[var(--aura-violet)]" />
          </div>
          <div className="text-2xl font-mono font-bold">{stats.eventsLast7Days}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span
              className={cn(
                'font-semibold',
                stats.eventChange >= 0 ? 'text-[var(--aura-aqua)]' : 'text-[var(--aura-coral)]'
              )}
            >
              {stats.eventChange >= 0 ? '+' : ''}
              {Math.round(stats.eventChange)}%
            </span>{' '}
            vs prev 7d
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Total Events</span>
          </div>
          <div className="text-2xl font-mono font-bold">{events.length}</div>
          <div className="mt-1 text-xs text-muted-foreground">All time</div>
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
            Activity
          </TabsTrigger>
          <TabsTrigger value="severity">
            <ChartPie size={16} className="mr-1.5" />
            Severity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4 mt-4">
          <Card className="p-6 border-border bg-card/50">
            <div className="mb-4">
              <h3 className="text-base font-space font-semibold flex items-center gap-2">
                <ChartLine size={20} className="text-[var(--aura-aqua)]" />
                Health Score Trends (30 days)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Historical health and governance scores
              </p>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C212B" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={11}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11151C',
                    border: '1px solid #1C212B',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone"
                  dataKey="healthScore"
                  stroke="#4FD1C5"
                  strokeWidth={2}
                  fill="url(#healthGradient)"
                  name="Health Score"
                />
                <Area
                  type="monotone"
                  dataKey="governanceScore"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  fill="url(#governanceGradient)"
                  name="Governance Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-4">
          <Card className="p-6 border-border bg-card/50">
            <div className="mb-4">
              <h3 className="text-base font-space font-semibold flex items-center gap-2">
                <ChartBar size={20} className="text-[var(--aura-violet)]" />
                Event Activity (30 days)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Daily event counts by type
              </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C212B" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={11}
                  interval="preserveStartEnd"
                />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11151C',
                    border: '1px solid #1C212B',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} iconSize={8} />
                <Bar dataKey="scan" fill="#4FD1C5" name="Scans" stackId="a" />
                <Bar dataKey="governance" fill="#A78BFA" name="Governance" stackId="a" />
                <Bar dataKey="healing" fill="#FACC15" name="Healing" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="severity" className="space-y-4 mt-4">
          <Card className="p-6 border-border bg-card/50">
            <div className="mb-4">
              <h3 className="text-base font-space font-semibold flex items-center gap-2">
                <ChartPie size={20} className="text-[var(--aura-yellow)]" />
                Event Severity Distribution
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Breakdown of events by severity level
              </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
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
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <Card className="mt-4 p-4 border-border bg-card/30">
              <div className="space-y-2">
                {severityData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
