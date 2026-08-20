import { Signal, SignalHigh, SignalLow } from 'lucide-react'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

interface DifficultyBadgeProps {
  level: DifficultyLevel | null
  size?: 'sm' | 'md'
}

const difficultyConfig = {
  beginner: {
    label: 'Principiante',
    icon: SignalLow
  },
  intermediate: {
    label: 'Intermedio',
    icon: Signal
  },
  advanced: {
    label: 'Avanzado',
    icon: SignalHigh
  }
}

export default function DifficultyBadge({ level, size = 'sm' }: DifficultyBadgeProps) {
  if (!level) return null

  const config = difficultyConfig[level]
  const Icon = config.icon

  const sizeClass = size === 'sm' ? 'difficulty-badge--sm' : 'difficulty-badge--md'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <span className={`difficulty-badge difficulty-badge--${level} ${sizeClass}`}>
      <Icon className={iconSize} />
      {config.label}
    </span>
  )
}
