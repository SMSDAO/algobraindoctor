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
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 border-border bg-card/50">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            {parseFloat(stats.healthChange) >= 0 ? (
              <TrendUp size={14} className="sm:w-4 sm:h-4 text-[var(--aura-aqua)]" />
            ) : (
              <TrendDown size={14} className="sm:w-4 sm:h-4 text-[var(--aura-coral)]" />
            )}
            <div className="text-[10px] sm:text-xs text-muted-foreground">7-Day Avg Health</div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold">
            {stats.currentAvgHealth}
            <span
              className={cn(
                'text-xs sm:text-sm ml-1.5 sm:ml-2',
                parseFloat(stats.healthChange) >= 0 ? 'text-[var(--aura-aqua)]' : 'text-[var(--aura-coral)]'
              )}
            >
              {parseFloat(stats.healthChange) >= 0 ? '+' : ''}
              {stats.healthChange}%
            </span>
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">vs previous 7 days</div>
        </Card>

        <Card className="p-3 sm:p-4 border-border bg-card/50">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            {stats.eventChange >= 0 ? (
              <TrendUp size={14} className="sm:w-4 sm:h-4 text-[var(--aura-violet)]" />
            ) : (
              <TrendDown size={14} className="sm:w-4 sm:h-4 text-[var(--aura-coral)]" />
            )}
            <div className="text-[10px] sm:text-xs text-muted-foreground">Events (7 days)</div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold">
            {stats.last7DaysEvents}
            <span
              className={cn(
                'text-xs sm:text-sm ml-1.5 sm:ml-2',
                stats.eventChange >= 0 ? 'text-[var(--aura-violet)]' : 'text-[var(--aura-coral)]'
              )}
            >
              {stats.eventChange >= 0 ? '+' : ''}
              {stats.eventChange}
            </span>
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">vs previous 7 days</div>
        </Card>

        <Card className="p-3 sm:p-4 border-border bg-card/50 col-span-1 sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Current Health</div>
          </div>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--aura-aqua)]">
            {repo.healthScore}
          </div>
          <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground">
            Governance: {repo.governanceScore} • Activity: {repo.activityScore}
          </div>
        </Card>
      </div>

      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="scores" className="text-xs sm:text-sm py-2">
            <ChartLine size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
            Scores
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm py-2">
            <ChartBar size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="severity" className="text-xs sm:text-sm py-2">
            <ChartPie size={14} className="sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
            Severity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="p-4 sm:p-6 border-border bg-card/50">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-space font-semibold flex items-center gap-2">
                <ChartLine size={18} className="sm:w-5 sm:h-5 text-[var(--aura-violet)]" />
                Score History (30 days)
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Historical health and governance scores
              </p>
            </div>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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

        <TabsContent value="activity" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="p-4 sm:p-6 border-border bg-card/50">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-space font-semibold flex items-center gap-2">
                <ChartBar size={18} className="sm:w-5 sm:h-5 text-[var(--aura-yellow)]" />
                Activity Timeline
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Daily event counts by type
              </p>
            </div>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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

        <TabsContent value="severity" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <Card className="p-4 sm:p-6 border-border bg-card/50">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-sm sm:text-base font-space font-semibold flex items-center gap-2">
                <ChartPie size={18} className="sm:w-5 sm:h-5 text-[var(--aura-blue)]" />
                Event Severity Distribution
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Breakdown of events by severity level
              </p>
            </div>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
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
            <Card className="mt-3 sm:mt-4 p-3 sm:p-4 border-border bg-card/30">
              <div className="space-y-1.5 sm:space-y-2">
                {severityData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs sm:text-sm">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] sm:text-xs">
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
