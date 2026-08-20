import { Clock } from 'lucide-react'

interface ReadingTimeBadgeProps {
  minutes: number | null
  size?: 'sm' | 'md'
}

export default function ReadingTimeBadge({ minutes, size = 'sm' }: ReadingTimeBadgeProps) {
  if (!minutes) return null

  const sizeClass = size === 'sm' ? 'reading-time-badge--sm' : 'reading-time-badge--md'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <span className={`reading-time-badge ${sizeClass}`}>
      <Clock className={iconSize} />
      {minutes} min
    </span>
  )
}
