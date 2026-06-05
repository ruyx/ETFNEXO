interface ProgressBarProps {
  label: string;
  value: number;
  variant: 'performance' | 'cost' | 'liquidity' | 'community';
}

export default function ProgressBar({ label, value, variant }: ProgressBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-900 font-semibold">{value.toFixed(0)}</span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-bar__fill progress-bar__fill--${variant}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
