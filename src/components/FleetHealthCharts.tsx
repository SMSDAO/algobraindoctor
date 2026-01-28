import { useMemo } from 'react'
import { Repository, Worker } from '@/lib/types'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChartLine,
  TrendUp,
  TrendDown,
  GitBranch,
  Gear,
  Pulse,
  ShieldCheck,
  Lightning,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface FleetHealthChartsProps {
  repositories: Repository[]
  workers: Worker[]
  className?: string
}

export function FleetHealthCharts({ repositories, workers, className }: FleetHealthChartsProps) {
  const fleetStats = useMemo(() => {
    if (repositories.length === 0) {
      return {
        avgHealth: 0,
        avgGovernance: 0,
        avgActivity: 0,
        healthyRepos: 0,
        degradedRepos: 0,
        criticalRepos: 0,
      }
    }

    const avgHealth = Math.round(
      repositories.reduce((sum, r) => sum + r.healthScore, 0) / repositories.length
    )
    const avgGovernance = Math.round(
      repositories.reduce((sum, r) => sum + r.governanceScore, 0) / repositories.length
    )
    const avgActivity = Math.round(
      repositories.reduce((sum, r) => sum + r.activityScore, 0) / repositories.length
    )

    const healthyRepos = repositories.filter((r) => r.healthScore >= 80).length
    const degradedRepos = repositories.filter(
      (r) => r.healthScore >= 50 && r.healthScore < 80
    ).length
    const criticalRepos = repositories.filter((r) => r.healthScore < 50).length

    return {
      avgHealth,
      avgGovernance,
      avgActivity,
      healthyRepos,
      degradedRepos,
      criticalRepos,
    }
  }, [repositories])

  const scoreDistributionData = useMemo(() => {
    const buckets = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      '0-49': 0,
    }

    repositories.forEach((repo) => {
      const score = repo.healthScore
      if (score >= 90) buckets['90-100']++
      else if (score >= 80) buckets['80-89']++
      else if (score >= 70) buckets['70-79']++
      else if (score >= 60) buckets['60-69']++
      else if (score >= 50) buckets['50-59']++
      else buckets['0-49']++
    })

    return [
      { range: '90-100', count: buckets['90-100'], fill: '#4FD1C5' },
      { range: '80-89', count: buckets['80-89'], fill: '#A78BFA' },
      { range: '70-79', count: buckets['70-79'], fill: '#FACC15' },
      { range: '60-69', count: buckets['60-69'], fill: '#FB923C' },
      { range: '50-59', count: buckets['50-59'], fill: '#F87171' },
      { range: '0-49', count: buckets['0-49'], fill: '#DC2626' },
    ]
  }, [repositories])

  const workerStats = useMemo(() => {
    if (workers.length === 0) return { healthy: 0, degraded: 0, failed: 0 }

    return {
      healthy: workers.filter((w) => w.status === 'healthy').length,
      degraded: workers.filter((w) => w.status === 'degraded').length,
      failed: workers.filter((w) => w.status === 'failed').length,
    }
  }, [workers])

  const radialData = useMemo(() => {
    return [
      {
        name: 'Health',
        value: fleetStats.avgHealth,
        fill: '#4FD1C5',
      },
      {
        name: 'Governance',
        value: fleetStats.avgGovernance,
        fill: '#A78BFA',
      },
      {
        name: 'Activity',
        value: fleetStats.avgActivity,
        fill: '#FACC15',
      },
    ]
  }, [fleetStats])

  const topRepos = useMemo(() => {
    return [...repositories]
      .sort((a, b) => b.healthScore - a.healthScore)
      .slice(0, 5)
  }, [repositories])

  const bottomRepos = useMemo(() => {
    return [...repositories]
      .sort((a, b) => a.healthScore - b.healthScore)
      .slice(0, 5)
  }, [repositories])

  return (
    <div className={cn('space-y-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border bg-card/50 neon-border-aqua glow-aqua">
          <div className="mb-6">
            <h3 className="text-base font-space font-semibold flex items-center gap-2">
              <ChartLine size={20} className="text-[var(--aura-aqua)]" />
              Fleet Average Scores
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Overall health metrics across all repositories
            </p>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                background
                dataKey="value"
              />
              <Legend
                iconSize={10}
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#11151C',
                  border: '1px solid #1C212B',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-border bg-card/50">
          <div className="mb-6">
            <h3 className="text-base font-space font-semibold flex items-center gap-2">
              <GitBranch size={20} className="text-[var(--aura-violet)]" />
              Repository Health Distribution
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Number of repositories by health score range
            </p>
          </div>

          <div className="space-y-3">
            {scoreDistributionData.map((item) => (
              <div key={item.range} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="font-mono font-medium">{item.range}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">{item.count}</span>
                    <Badge variant="outline" className="font-mono text-xs min-w-[50px]">
                      {repositories.length > 0
                        ? ((item.count / repositories.length) * 100).toFixed(0)
                        : 0}
                      %
                    </Badge>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width:
                        repositories.length > 0
                          ? `${(item.count / repositories.length) * 100}%`
                          : '0%',
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-card/50 neon-border-aqua">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--aura-aqua)]/10 flex items-center justify-center">
              <ShieldCheck size={20} className="text-[var(--aura-aqua)]" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Healthy Repos</div>
              <div className="text-xl font-mono font-bold text-[var(--aura-aqua)]">
                {fleetStats.healthyRepos}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Score ≥ 80 •{' '}
            <span className="font-semibold text-foreground">
              {repositories.length > 0
                ? ((fleetStats.healthyRepos / repositories.length) * 100).toFixed(0)
                : 0}
              %
            </span>{' '}
            of fleet
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50 neon-border-yellow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--aura-yellow)]/10 flex items-center justify-center">
              <Lightning size={20} className="text-[var(--aura-yellow)]" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Degraded Repos</div>
              <div className="text-xl font-mono font-bold text-[var(--aura-yellow)]">
                {fleetStats.degradedRepos}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Score 50-79 •{' '}
            <span className="font-semibold text-foreground">
              {repositories.length > 0
                ? ((fleetStats.degradedRepos / repositories.length) * 100).toFixed(0)
                : 0}
              %
            </span>{' '}
            of fleet
          </div>
        </Card>

        <Card className="p-4 border-border bg-card/50 neon-border-coral">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--aura-coral)]/10 flex items-center justify-center">
              <Pulse size={20} className="text-[var(--aura-coral)]" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Critical Repos</div>
              <div className="text-xl font-mono font-bold text-[var(--aura-coral)]">
                {fleetStats.criticalRepos}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Score &lt; 50 •{' '}
            <span className="font-semibold text-foreground">
              {repositories.length > 0
                ? ((fleetStats.criticalRepos / repositories.length) * 100).toFixed(0)
                : 0}
              %
            </span>{' '}
            of fleet
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-border bg-card/50">
          <div className="mb-4">
            <h3 className="text-base font-space font-semibold flex items-center gap-2">
              <TrendUp size={20} className="text-green-400" />
              Top Performers
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Highest health scores in fleet
            </p>
          </div>
          <div className="space-y-2">
            {topRepos.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No repositories yet
              </div>
            ) : (
              topRepos.map((repo, index) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="w-6 h-6 rounded-full flex items-center justify-center p-0 font-mono text-xs"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium font-mono">
                        {repo.owner}/{repo.name}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className="font-mono font-bold neon-border-aqua glow-aqua"
                    variant="outline"
                  >
                    {repo.healthScore}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 border-border bg-card/50">
          <div className="mb-4">
            <h3 className="text-base font-space font-semibold flex items-center gap-2">
              <TrendDown size={20} className="text-[var(--aura-coral)]" />
              Needs Attention
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Lowest health scores in fleet
            </p>
          </div>
          <div className="space-y-2">
            {bottomRepos.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No repositories yet
              </div>
            ) : (
              bottomRepos.map((repo, index) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="w-6 h-6 rounded-full flex items-center justify-center p-0 font-mono text-xs"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium font-mono">
                        {repo.owner}/{repo.name}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className="font-mono font-bold neon-border-coral glow-coral"
                    variant="outline"
                  >
                    {repo.healthScore}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6 border-border bg-card/50 neon-border-violet glow-violet">
        <div className="mb-4">
          <h3 className="text-base font-space font-semibold flex items-center gap-2">
            <Gear size={20} className="text-[var(--aura-violet)]" />
            Worker Pool Status
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Current status of all parallel workers
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="text-2xl font-mono font-bold text-green-400 mb-1">
              {workerStats.healthy}
            </div>
            <div className="text-xs text-muted-foreground">Healthy Workers</div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--aura-yellow)]/10 border border-[var(--aura-yellow)]/30">
            <div className="text-2xl font-mono font-bold text-[var(--aura-yellow)] mb-1">
              {workerStats.degraded}
            </div>
            <div className="text-xs text-muted-foreground">Degraded Workers</div>
          </div>

          <div className="p-4 rounded-lg bg-[var(--aura-coral)]/10 border border-[var(--aura-coral)]/30">
            <div className="text-2xl font-mono font-bold text-[var(--aura-coral)] mb-1">
              {workerStats.failed}
            </div>
            <div className="text-xs text-muted-foreground">Failed Workers</div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="text-xs text-muted-foreground mb-2">Total Jobs Completed</div>
          <div className="text-xl font-mono font-bold text-[var(--aura-violet)]">
            {workers.reduce((sum, w) => sum + w.jobsCompleted, 0).toLocaleString()}
          </div>
        </div>
      </Card>
    </div>
  )
}
