'use client'

interface ScoreRingProps {
  score: number // 0-100
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
}

export default function ScoreRing({
  score,
  size = 'sm',
  showLabel = false
}: ScoreRingProps) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score))

  // Corporate color based on score - subtle
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-slate-900'
    if (score >= 60) return 'text-slate-700'
    if (score >= 40) return 'text-slate-600'
    return 'text-slate-500'
  }

  const getStrokeColor = (score: number): string => {
    if (score >= 80) return '#0F172A' // slate-900
    if (score >= 60) return '#334155' // slate-700
    if (score >= 40) return '#475569' // slate-600
    return '#64748B' // slate-500
  }

  // Compact sizes
  const sizeConfig = {
    xs: { dimension: 40, strokeWidth: 3, fontSize: 'text-xs', radius: 17 },
    sm: { dimension: 48, strokeWidth: 3, fontSize: 'text-sm', radius: 21 },
    md: { dimension: 56, strokeWidth: 3, fontSize: 'text-base', radius: 25 },
  }

  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * config.radius
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={config.dimension}
          height={config.dimension}
        >
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={config.radius}
            stroke="#E2E8F0"
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={config.radius}
            stroke={getStrokeColor(normalizedScore)}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </svg>

        {/* Score text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`financial-number ${config.fontSize} ${getScoreColor(normalizedScore)} font-semibold`}>
            {Math.round(normalizedScore)}
          </span>
        </div>
      </div>

      {showLabel && (
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
          Score
        </span>
      )}
    </div>
  )
}
