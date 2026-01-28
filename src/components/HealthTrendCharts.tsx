import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
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
import { ChartLine, ChartBar, ChartPie, TrendUp, TrendDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { TimelineEvent, Repository } from '@/lib/types'

interface HealthTrendChartsProps {
  events: TimelineEvent[]
  repo: Repository
  className?: string
}

export function HealthTrendCharts({ events, repo, className }: HealthTrendChartsProps) {
  const scoreHistoryData = useMemo(() => {
    const dataPoints: Array<{ date: string; healthScore: number; governanceScore: number }> = []

    let currentHealthScore = repo.healthScore
    let currentGovernanceScore = repo.governanceScore

    for (let i = 30; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dayEvents = events.filter((e) => {
        const eventDate = new Date(e.timestamp)
        return eventDate.toDateString() === date.toDateString()
      })

      dayEvents.forEach((event) => {
        if (event.metadata?.oldScore && event.metadata?.newScore) {
          const scoreChange = (event.metadata.newScore as number) - (event.metadata.oldScore as number)
          currentHealthScore += scoreChange
        }
      })

      dataPoints.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        healthScore: Math.round(currentHealthScore),
        governanceScore: Math.round(currentGovernanceScore),
      })
    }

    return dataPoints
  }, [events, repo])

  const activityData = useMemo(() => {
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

      const existing = counts.get(dateKey)!
      if (event.type === 'scan') existing.scan++
      else if (event.type === 'governance') existing.governance++
      else if (event.type === 'healing') existing.healing++
    })

    return Array.from(counts.values()).slice(-30)
  }, [events])

  const severityData = useMemo(() => {
    const counts = {
      success: 0,
      info: 0,
      warning: 0,
      error: 0,
    }

    events.forEach((event) => {
      if (event.severity in counts) {
        counts[event.severity as keyof typeof counts]++
      }
    })

    return [
      { name: 'Success', value: counts.success, color: '#4FD1C5' },
      { name: 'Info', value: counts.info, color: '#60A5FA' },
      { name: 'Warning', value: counts.warning, color: '#FB923C' },
      { name: 'Error', value: counts.error, color: '#DC2626' },
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

    const eventChange = last7Days.length - prev7Days.length

    return {
      currentAvgHealth: Math.round(currentAvgHealth),
      healthChange: healthChange.toFixed(1),
      last7DaysEvents: last7Days.length,
      eventChange,
    }
  }, [events, scoreHistoryData])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-2 mb-1">
            {parseFloat(stats.healthChange) >= 0 ? (
              <TrendUp size={16} className="text-[var(--aura-aqua)]" />
            ) : (
              <TrendDown size={16} className="text-[var(--aura-coral)]" />
            )}
            <div className="text-xs text-muted-foreground">7-Day Avg Health</div>
          </div>
          <div className="text-2xl font-mono font-bold">
            {stats.currentAvgHealth}
            <span
              className={cn(
                'text-sm ml-2',
                parseFloat(stats.healthChange) >= 0 ? 'text-[var(--aura-aqua)]' : 'text-[var(--aura-coral)]'
              )}
            >
              {parseFloat(stats.healthChange) >= 0 ? '+' : ''}
              {stats.healthChange}%
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">vs previous 7 days</div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-2 mb-1">
            {stats.eventChange >= 0 ? (
              <TrendUp size={16} className="text-[var(--aura-violet)]" />
            ) : (
              <TrendDown size={16} className="text-[var(--aura-coral)]" />
            )}
            <div className="text-xs text-muted-foreground">Events (7 days)</div>
          </div>
          <div className="text-2xl font-mono font-bold">
            {stats.last7DaysEvents}
            <span
              className={cn(
                'text-sm ml-2',
                stats.eventChange >= 0 ? 'text-[var(--aura-violet)]' : 'text-[var(--aura-coral)]'
              )}
            >
              {stats.eventChange >= 0 ? '+' : ''}
              {stats.eventChange}
            </span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">vs previous 7 days</div>
        </Card>

        <Card className="p-4 border-border bg-card/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="text-xs text-muted-foreground">Current Health</div>
          </div>
          <div className="text-2xl font-mono font-bold text-[var(--aura-aqua)]">
            {repo.healthScore}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Governance: {repo.governanceScore} • Activity: {repo.activityScore}
          </div>
        </Card>
      </div>

      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scores">
            <ChartLine size={16} className="mr-1.5" />
            Scores
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
                <ChartLine size={20} className="text-[var(--aura-violet)]" />
                Score History (30 days)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Historical health and governance scores
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={scoreHistoryData}>
                <defs>
                  <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4FD1C5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4FD1C5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGovernance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C212B" />
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  stroke="#6B7280"
                  interval="preserveStartEnd"
                />
                <YAxis fontSize={11} stroke="#6B7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11151C',
                    border: '1px solid #1C212B',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="healthScore"
                  stroke="#4FD1C5"
                  fillOpacity={1}
                  fill="url(#colorHealth)"
                  name="Health Score"
                />
                <Area
                  type="monotone"
                  dataKey="governanceScore"
                  stroke="#A78BFA"
                  fillOpacity={1}
                  fill="url(#colorGovernance)"
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
                <ChartBar size={20} className="text-[var(--aura-yellow)]" />
                Activity Timeline
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Daily event counts by type
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C212B" />
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  stroke="#6B7280"
                  interval="preserveStartEnd"
                />
                <YAxis fontSize={11} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11151C',
                    border: '1px solid #1C212B',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#9CA3AF' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
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
                <ChartPie size={20} className="text-[var(--aura-blue)]" />
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
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
