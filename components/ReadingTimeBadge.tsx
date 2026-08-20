import { Clock } from 'lucide-react'

interface ReadingTimeBadgeProps {
  minutes: number | null
  size?: 'sm' | 'md'
}

export default function ReadingTimeBadge({ minutes, size = 'sm' }: ReadingTimeBadgeProps) {
  if (!minutes) return null

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5'

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border bg-slate-50 text-slate-600 border-slate-200 ${sizeClasses}`}
    >
      <Clock className={iconSize} />
      {minutes} min
    </span>
  )
}
