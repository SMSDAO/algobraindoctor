import { useMemo } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface HealthSparklineProps {
  currentScore: number
  className?: string
}

export function HealthSparkline({ currentScore, className }: HealthSparklineProps) {
  const data = useMemo(() => {
    const points: { value: number }[] = []
    let score = Math.max(50, currentScore - Math.random() * 20)

    for (let i = 0; i < 10; i++) {
      const trend = (currentScore - score) / 10
      score = Math.min(100, Math.max(0, score + trend + (Math.random() - 0.5) * 5))
      points.push({ value: score })
    }

    points.push({ value: currentScore })
    return points
  }, [currentScore])

  const color = currentScore >= 80 ? '#4FD1C5' : currentScore >= 50 ? '#FACC15' : '#F87171'

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
