import { useMemo } from 'react'
import {
import {
  Area,
  XAxis,
  Tooltip,
  Radial
  Legend
import { C
import {
  TrendUp,
  GitBranch,
  Pulse,
  Lightning,
import { cn } from '@/lib/utils'
interface FleetHealthChartsProps {
  worker
}
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
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-4 sm:p-6 border-border bg-card/50 neon-border-aqua glow-aqua">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-sm sm:text-base font-space font-semibold flex items-center gap-2">
              <ChartLine size={18} className="sm:w-5 sm:h-5 text-[var(--aura-aqua)]" />
              Fleet Average Scores
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Overall health metrics across all repositories
            </p>
          </div>

          <ResponsiveContainer width="100%" height={200} className="sm:h-[240px]">
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

                : 0}
            </span>{' '}
          </div>
      </div>
      <div classNa
          <div cl
              <TrendUp size={18} className="sm:w-5 sm:h-5 text-green-400" />
            </h3>
              Highest health scores in fle
          </div>
            {topRe
                
            ) : (
                <div
                  className="flex items-center justify-betwe
                  <div className="flex
                      variant="outline"
                    
               
                      <d
                    
                
               
            

              ))
          </div>

          <div className="mb-3 sm:mb-4">
              <TrendDown size={18} className="sm:w-5 sm:h-5 te
            </h3>
              Low
          </div>
            {bottomRepos.length === 0 ? (
                
            ) : 
                <div
                  className="flex item
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 fle
                      variant="outl
                    
                 
                      <div className="text-xs
                    
                  </div>
                    className="font-mono font-bold neon-border-coral glow-coral text-xs ml-2 flex-shrink-0"
                 
                  </Badge>
              ))
          </div>
      </div>
      <Card className
          <h3 className="text-sm 
            Worker Pool Stat
          <p className="t
          </p>

          <div className="p-
              {workerStats
            <div classNa

            <div className="text-xl sm:text-2xl font-mono font-bold text-[var(
            </div>
          </div>
          <div className="p-3 sm:p-4 r
              {workerStats
            <div class
        </div>
        <div c
          <div c
          </div

  )


























































































