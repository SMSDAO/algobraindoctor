import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pulse, GitBranch, IdentificationCard } from '@phosphor-icons/react'
import { Repository } from '@/lib/types'
import { cn } from '@/lib/utils'

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
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GitBranch size={20} className="text-muted-foreground" />
            <CardTitle className="text-lg font-space">
              {repo.owner}/{repo.name}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn('font-mono text-xs', healthColor, glowClass)}
          >
            {repo.healthScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Pulse size={16} className="text-[var(--aura-aqua)]" />
            <span className="text-muted-foreground">Activity:</span>
            <span className="font-mono font-medium">{repo.activityScore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <IdentificationCard size={16} className="text-[var(--aura-violet)]" />
            <span className="text-muted-foreground">Claims:</span>
            <span className="font-mono font-medium">{repo.claimsCount}</span>
          </div>
        </div>

        {repo.frameworks.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.frameworks.map((fw) => (
              <Badge
                key={fw}
                variant="secondary"
                className="text-xs neon-border-yellow"
              >
                {fw}
              </Badge>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground font-mono">
          Last indexed: {new Date(repo.lastIndexedAt).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
