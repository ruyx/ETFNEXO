import { Signal, SignalHigh, SignalLow } from 'lucide-react'

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

interface DifficultyBadgeProps {
  level: DifficultyLevel | null
  size?: 'sm' | 'md'
}

const difficultyConfig = {
  beginner: {
    label: 'Principiante',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: SignalLow
  },
  intermediate: {
    label: 'Intermedio',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Signal
  },
  advanced: {
    label: 'Avanzado',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: SignalHigh
  }
}

export default function DifficultyBadge({ level, size = 'sm' }: DifficultyBadgeProps) {
  if (!level) return null

  const config = difficultyConfig[level]
  const Icon = config.icon

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5'

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.color} ${sizeClasses}`}
    >
      <Icon className={iconSize} />
      {config.label}
    </span>
  )
}
