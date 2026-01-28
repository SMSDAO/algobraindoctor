import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pulse, GitBranch, IdentificationCard } from '@phosphor-icons/react'
import { Repository } from '@/lib/types'
import { cn } from '@/lib/utils'
import { HealthSparkline } from '@/components/HealthSparkline'

interface RepoCardProps {
  repo: Repository
  onClick?: () => void
  selected?: boolean
}

export function RepoCard({ repo, onClick, selected }: RepoCardProps) {
  const healthColor =
    repo.healthScore >= 80
      ? 'text-[var(--aura-aqua)]'
      : repo.healthScore >= 50
      ? 'text-[var(--aura-yellow)]'
      : 'text-[var(--aura-coral)]'

  const glowClass =
    repo.healthScore >= 80
      ? 'glow-aqua'
      : repo.healthScore >= 50
      ? 'glow-yellow'
      : 'glow-coral'

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:scale-[1.02]',
        selected ? 'neon-border-violet glow-violet' : 'hover:neon-border-aqua',
        'bg-card/80 backdrop-blur-sm'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <GitBranch size={18} className="sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
            <CardTitle className="text-sm sm:text-lg font-space truncate">
              {repo.owner}/{repo.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <HealthSparkline currentScore={repo.healthScore} className="w-12 h-6 sm:w-16 sm:h-8" />
            <Badge
              variant="outline"
              className={cn('font-mono text-[10px] sm:text-xs', healthColor, glowClass)}
            >
              {repo.healthScore}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Pulse size={14} className="sm:w-4 sm:h-4 text-[var(--aura-aqua)]" />
            <span className="text-muted-foreground hidden sm:inline">Activity:</span>
            <span className="text-muted-foreground sm:hidden">Act:</span>
            <span className="font-mono font-medium">{repo.activityScore}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <IdentificationCard size={14} className="sm:w-4 sm:h-4 text-[var(--aura-violet)]" />
            <span className="text-muted-foreground hidden sm:inline">Claims:</span>
            <span className="text-muted-foreground sm:hidden">Clm:</span>
            <span className="font-mono font-medium">{repo.claimsCount}</span>
          </div>
        </div>

        {repo.frameworks.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {repo.frameworks.slice(0, 3).map((fw) => (
              <Badge
                key={fw}
                variant="secondary"
                className="text-[10px] sm:text-xs neon-border-yellow"
              >
                {fw}
              </Badge>
            ))}
            {repo.frameworks.length > 3 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs">
                +{repo.frameworks.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">
          Last indexed: {new Date(repo.lastIndexedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
